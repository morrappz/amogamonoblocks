import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const PAGE_SIZE = 10000;
    let page = 0;
    let allRows: unknown[] = [];

    while (true) {
      const { data, error } = await postgrest
      .from("final_bom_item")
      .select(
        `bom_name, bom_type, bom_code, model, variant, frame, engine, mission, 
        c_l, c_part_no, c_part_name, c_c, c_d, c_sec, c_item, c_sgr,c_share, c_p_mp_code, c_l1_part_no, 
        c_b, c_sfx, c_line_no, c_e_f, c_inproc, c_gr, c_parent_part_no, c_p_mp_part, c_qty_l1, c_parent_seq, 
        c_seq, c_mp, c_sgrseq, c_op, c_env, c_sn, c_hns, c_hg_target_weight, c_basic_part_no, c_appl_dc_no, 
        c_dwg_issue_dc_no, c_femd, c_sw, c_begin, c_end, c_loc1_a, c_loc2_a, c_loc3_a `
      ).eq("final_bom_id", Number(id))
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      
      if (error) {
        console.error("Error exporting final bom data:", error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      
      if (!data.length) break;

      allRows = allRows.concat(data);
      page++;
    }

  const csv = convertToCSV(allRows);
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="FinalBomItemsFull.csv"`,
    },
  });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch final bom data" },
      { status: 500 }
    );
  }
}

// Helper to convert data to CSV format
function convertToCSV(data: Record<string, unknown>[]): string {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // header row
    ...data.map((row) =>
      headers
        .map((header) =>
          JSON.stringify(row[header] ?? "").replace(/\n/g, " ")
        )
        .join(",")
    ),
  ];

  return csvRows.join("\n");
}