import { NextRequest, NextResponse } from "next/server";
import { postgrest } from "@/lib/postgrest";
import { auth } from "@/auth";

type Template = {
  filter: Record<string, string>[];
  ignore_empty: string[];
  ignore_prefix: Record<string, string[]>;
  ignore_values: Record<string, string[]>;
  ignore_combinations: Record<string, string>[];
  never_ignore: Record<string, string[]>;
};

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const data_group_id = searchParams.get("data_group_id");
    const id = searchParams.get("id");
    const count_all = searchParams.get("count_all");

    if (!data_group_id || !id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    if (count_all) {
      const { count } = await postgrest
        .from("raw_bom_upload")
        .select("*", { count: "exact", head: true })
        .eq("data_upload_id", Number(id));
      return NextResponse.json(
        { success: true, rawBomCount: count },
        { status: 200 }
      );
    }

    const { data: data_group, error: error_data_group } = await postgrest
      .from("data_group")
      .select("data_group_id, data_group_name, data_combination_json")
      .eq("data_group_id", Number(data_group_id))
      .single();

    if (error_data_group || !data_group) {
      console.error("Error fetching data group:", error_data_group);
      return NextResponse.json(
        {
          success: false,
          error: error_data_group
            ? error_data_group.message
            : "Data group not found",
        },
        { status: 500 }
      );
    }

    const template = data_group.data_combination_json as Template;

    const paramsArray: string[] = [];
    (template.filter || []).forEach((variant) => {
      Object.entries(variant).forEach(([key, value]) => {
        console.log("value, key", value, key);
        if (["mission", "engine", "frame"].includes(key)) {
          paramsArray.push("c_" + value.toLowerCase());
        }
      });
    });


    const { data, error } = await postgrest.rpc("dynamic_table_filter", {
      filters: data_group.data_combination_json,
      select_fields: " * ",
      table_name: "raw_bom_upload",
      extra_condition: `data_upload_id = '${id}'`,
    });

    if (error) {
      console.error("Error fetching raw bom data:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
      rawBomCount: data?.length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch raw bom data" },
      { status: 500 }
    );
  }
}
