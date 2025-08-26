import { NextRequest, NextResponse } from "next/server";
import { postgrest } from "@/lib/postgrest";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const frame = searchParams.get("frame")?.toLowerCase();
    const engine = searchParams.get("engine")?.toLowerCase();
    const mission = searchParams.get("mission")?.toLowerCase();
    const model = searchParams.get("model");
    const variant = searchParams.get("variant");

    if (!id || !frame || !engine || !mission) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Server side filtering has issues, so used client side.

    const { data, error } = await postgrest
    .from("raw_bom_upload")
    .select(
      ` c_l, c_part_no, c_part_name, c_c, c_d, c_sec, c_item, c_sgr,c_share, c_p_mp_code, c_l1_part_no, 
      c_b, c_sfx, c_line_no, c_e_f, c_inproc, c_gr, c_parent_part_no, c_p_mp_part, c_qty_l1, c_parent_seq, 
      c_seq, c_mp, c_sgrseq, c_op, c_env, c_sn, c_hns, c_hg_target_weight, c_basic_part_no, c_appl_dc_no, 
      c_dwg_issue_dc_no, c_femd, c_sw, c_begin, c_end, c_loc1_a, c_loc2_a, c_loc3_a, 
      c_${frame}, c_${engine}, c_${mission} `
    ).eq("data_upload_id", Number(id))
    
    interface RawBomRow {
      [key: string]: string | number | null;
    }

    // Remove the data where frame and engine and mission having empty
    const filteredData = ((data ?? []) as unknown as RawBomRow[]).filter((row: RawBomRow) => {
      const frameKey = `c_${frame}`;
      const engineKey = `c_${engine}`;
      const missionKey = `c_${mission}`;

      const frameVal = row[frameKey];
      const engineVal = row[engineKey];
      const missionVal = row[missionKey];

      const hasValue =
        (frameVal && frameVal !== '') ||
        (engineVal && engineVal !== '') ||
        (missionVal && missionVal !== '');

      if (hasValue) {
        delete row[frameKey];
        delete row[engineKey];
        delete row[missionKey];
        return true;
      }

      return false;
      
    });

    if (error) {
      console.error("Error fetching raw bom data:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Add model, variant, frame, engine, mission to each row
    const enhancedData = filteredData.map((row: RawBomRow) => ({
      model, 
      variant, 
      frame,
      engine,
      mission,
      ...row, 
    }));
    return NextResponse.json({ success: true, data: enhancedData, rawBomCount:data?.length });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch raw bom data" },
      { status: 500 }
    );
  }
}
