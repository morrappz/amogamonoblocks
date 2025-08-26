import { NextRequest, NextResponse } from "next/server";
import { postgrest } from "@/lib/postgrest";
import { auth } from "@/auth";
import { PostgrestError } from "@supabase/postgrest-js";

const CHUNK_SIZE = 1000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 200;
const MAX_CONCURRENT_CHUNKS = 1;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await wait(delay);
    return retryOperation(operation, retries - 1, delay);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { bom_name, bom_item_description, data_upload_id, items } = body;

    if (!bom_name || !items?.length || !data_upload_id) {
      return NextResponse.json(
        { success: false, error: "Missing name, items, or data_upload_id" },
        { status: 400 }
      );
    }

    const userInfo = {
      created_user_id: session.user.user_catalog_id,
      created_user_name: session.user.user_name || "",
      business_number: session.user.business_number || "",
      business_name: session.user.business_name || "",
      for_business_number: session.user.business_number || "",
      for_business_name: session.user.business_name || "",
    };

    // Create final_bom entry
    // Get the first item from the array
    const firstItem = items[0];

    // Destructure required fields from the first item
    const { model, variant, frame, engine, mission } = firstItem;

    const { data, error } = await postgrest
      .from("final_bom")
      .insert([
        {
          bom_name,
          bom_description: bom_item_description,
          data_upload_id,
          model,
          variant,
          frame,
          engine,
          mission,
          created_date: new Date().toISOString(),
          status: "active",
          ...userInfo,
        },
      ])
      .select("final_bom_id")
      .single();

    if (error) throw error;

    const enrichedItems = items.map((item: Record<string, string>) => ({
      ...item,
      final_bom_id: data.final_bom_id,
      bom_name,
      bom_item_description,
      data_upload_id,
      ...userInfo,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
    }));

    let totalInserted = 0;

    for (
      let i = 0;
      i < enrichedItems.length;
      i += CHUNK_SIZE * MAX_CONCURRENT_CHUNKS
    ) {
      const chunkPromises = [];

      for (let j = 0; j < MAX_CONCURRENT_CHUNKS; j++) {
        const startIdx = i + j * CHUNK_SIZE;
        const chunk = enrichedItems.slice(startIdx, startIdx + CHUNK_SIZE);

        if (chunk.length > 0) {
          chunkPromises.push(
            retryOperation(async () => {
              const { error } = await postgrest
                .from("final_bom_item")
                .insert(chunk);

              if (error) throw error;
              return chunk.length;
            })
          );
        }
      }

      const results = await Promise.all(chunkPromises);
      totalInserted += results.reduce((acc, count) => acc + count, 0);
    }

    return NextResponse.json({
      success: true,
      insertedCount: totalInserted,
      totalItems: items.length,
    });
  } catch (error) {
    console.error("Final BOM Save Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error &&
          (error instanceof PostgrestError ||
            (typeof error === "object" && "message" in error))
            ? error.message
            : "Unknown error",
        insertedCount: 0,
        totalItems: 0,
      },
      { status: 500 }
    );
  }
}
