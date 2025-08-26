import { NextResponse } from "next/server";
import { postgrest } from "@/lib/postgrest";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await postgrest
      .from("data_upload")
      .select(
        "data_upload_id, file_name, created_date"
      );

    if (error) {
      console.error("Error fetching templates:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
