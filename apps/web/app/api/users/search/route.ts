import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const exclude = searchParams.get("exclude");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Parse excluded user IDs
    const excludeIds = exclude
      ? exclude.split(",").map(Number).filter(Boolean)
      : [];

    // Search users in user_catalog
    let supabaseQuery = postgrest
      .asAdmin()
      .from("user_catalog")
      .select("user_catalog_id, first_name, last_name, user_email")
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,user_email.ilike.%${query}%`
      )
      .limit(10);

    // Exclude already selected users
    if (excludeIds.length > 0) {
      supabaseQuery = supabaseQuery.not(
        "user_catalog_id",
        "in",
        `(${excludeIds.join(",")})`
      );
    }

    const { data: users, error } = await supabaseQuery;

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 }
      );
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
