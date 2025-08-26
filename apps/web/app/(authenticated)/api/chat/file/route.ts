import { generateCsvBuffer } from "@/utils/server/generateCsv";
import { generateDocBuffer } from "@/utils/server/generateDoc";
import { generatePDFBuffer } from "@/utils/server/generatePdf";
import { generateXlsxBuffer } from "@/utils/server/generateXlsx";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fileType, chart, table, story } = body;

  try {
    const headers = table?.data?.headers;
    const rows = table?.data?.rows;
    const title = `${table?.title || "Data"}`;

    if (!Array.isArray(headers) || !Array.isArray(rows)) {
      return new NextResponse("Invalid table structure", { status: 400 });
    }

    switch (fileType) {
      case "pdf": {
        const pdfResult = await generatePDFBuffer({ table, chart, story });
        return new NextResponse(pdfResult.buffer, {
          status: 200,
          headers: {
            "Content-Type": pdfResult.contentType,
            "Content-Disposition": `attachment; filename="${pdfResult.fileName}"`,
          },
        });
      }

      case "csv": {
        const csvBuffer = generateCsvBuffer({ table, chart, story });
        return new NextResponse(csvBuffer, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${title}.csv"`,
          },
        });
      }

      case "xlsx": {
        const { buffer, fileName, contentType } = generateXlsxBuffer({
          table,
          chart,
          story,
        });
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fileName}"`,
          },
        });
      }

      case "doc": {
        const { buffer, fileName, contentType } = await generateDocBuffer({
          table,
          chart,
          story,
        });
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fileName}"`,
          },
        });
      }

      default:
        return new NextResponse("Unsupported file type", { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ status: 500, error: (error as Error).message });
  }
}
