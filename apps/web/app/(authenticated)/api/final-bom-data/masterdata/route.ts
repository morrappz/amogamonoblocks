import { NextResponse } from "next/server";
import { postgrest } from "@/lib/postgrest";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const alias = searchParams.get("alias");

    if (!type || !alias) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
        
    const { data, error } = await postgrest
      .from("data_group")
      .select( "data_group_id, data_group_name, data_combination_json")
      .eq("data_group_type", type)
      .not("data_group_name", "is", null);

    if (error) {
      console.error(`Error fetching ${type} :`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    const aliasedData = data.map(item => ({
      data_group_id: item.data_group_id,
      [alias]: item.data_group_name,
      data_combination_json: item.data_combination_json
    }));

    return NextResponse.json({ success: true, data: aliasedData });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch masterdata" },
      { status: 500 }
    );
  }
}
