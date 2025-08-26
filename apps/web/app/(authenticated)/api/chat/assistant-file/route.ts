import { generateCsvBuffer } from "@/utils/server/generateCsv";
import { generateDocBuffer } from "@/utils/server/generateDoc";
import { generatePDFBuffer } from "@/utils/server/generatePdf";
import { generateXlsxBuffer } from "@/utils/server/generateXlsx";
import { NextRequest, NextResponse } from "next/server";

function getTableFromData(data: any[]) {
  if (!Array.isArray(data) || data.length === 0)
    return {
      title: "Customers",
      description: "Customer data export",
      data: { headers: [], rows: [] },
    };
  const headers = Object.keys(data[0]).filter(
    (key) => typeof data[0][key] !== "object" && !key.startsWith("_")
  );
  const rows = data.map((item) =>
    headers.map((header) => String(item[header] ?? ""))
  );
  return {
    title: "Customers",
    description: "Customer data export",
    data: {
      headers,
      rows,
    },
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fileType, data } = body;
  try {
    const table = getTableFromData(data);
    let responseData;
    let fileName;
    let contentType;
    switch (fileType) {
      case "pdf": {
        const pdfResult = await generatePDFBuffer({
          table,
          chart: undefined,
          story: undefined,
        });
        responseData =
          pdfResult.buffer instanceof Buffer
            ? new Uint8Array(pdfResult.buffer)
            : pdfResult.buffer;
        fileName = pdfResult.fileName;
        contentType = pdfResult.contentType;
        break;
      }
      case "csv": {
        const csvBuffer = generateCsvBuffer({
          table,
          chart: undefined,
          story: undefined,
        });
        responseData =
          csvBuffer instanceof Buffer ? new Uint8Array(csvBuffer) : csvBuffer;
        fileName = `${table.title}.csv`;
        contentType = "text/csv; charset=utf-8";
        break;
      }
      case "xlsx": {
        const xlsxResult = generateXlsxBuffer({
          table,
          chart: undefined,
          story: undefined,
        });
        responseData =
          xlsxResult.buffer instanceof Buffer
            ? new Uint8Array(xlsxResult.buffer)
            : xlsxResult.buffer;
        fileName = xlsxResult.fileName;
        contentType = xlsxResult.contentType;
        break;
      }
      case "doc": {
        const docResult = await generateDocBuffer({
          table,
          chart: undefined,
          story: undefined,
        });
        responseData =
          docResult.buffer instanceof Buffer
            ? new Uint8Array(docResult.buffer)
            : docResult.buffer;
        fileName = docResult.fileName;
        contentType = docResult.contentType;
        break;
      }
      default:
        return new NextResponse("Unsupported file type", { status: 400 });
    }
    return new NextResponse(responseData, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename=\"${fileName}\"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ status: 500, error: (error as Error).message });
  }
}
