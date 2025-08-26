// import { generateCsvBuffer } from "@/utils/server/generateCsv";
// import { generateDocBuffer } from "@/utils/server/generateDoc";
// import { generatePDFBuffer } from "@/utils/server/generatePdf";
// import { generateXlsxBuffer } from "@/utils/server/generateXlsx";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const { fileType, data, table } = body;

//   try {
//     const headers = table?.headers || data?.tabs?.table?.headers;
//     const rows = table?.rows || data?.tabs?.table?.rows;
//     const title = `${data?.title || "Data"}`;

//     if (!Array.isArray(headers) || !Array.isArray(rows)) {
//       return new NextResponse("Invalid table structure", { status: 400 });
//     }

//     switch (fileType) {
//       case "pdf": {
//         const pdfResult = await generatePDFBuffer({ data, table });

//         return new NextResponse(pdfResult.buffer, {
//           status: 200,
//           headers: {
//             "Content-Type": pdfResult.contentType,
//             "Content-Disposition": `attachment; filename="${pdfResult.fileName}"`,
//             "Content-Length": pdfResult.buffer.length.toString(),
//           },
//         });
//       }

//       case "csv": {
//         const csvBuffer = generateCsvBuffer({ headers, rows, title });
//         return new NextResponse(csvBuffer, {
//           status: 200,
//           headers: {
//             "Content-Type": "text/csv; charset=utf-8",
//             "Content-Disposition": `attachment; filename="${title}.csv"`,
//             "Content-Length": csvBuffer.length.toString(),
//           },
//         });
//       }

//       case "xlsx": {
//         const {
//           buffer: xlsxBuffer,
//           fileName: xlsxFileName,
//           contentType: xlsxContentType,
//         } = generateXlsxBuffer({ data, table });

//         return new NextResponse(xlsxBuffer, {
//           status: 200,
//           headers: {
//             "Content-Type": xlsxContentType,
//             "Content-Disposition": `attachment; filename="${xlsxFileName}"`,
//           },
//         });
//       }

//       case "doc": {
//         const {
//           buffer: docBuffer,
//           fileName: docFileName,
//           contentType: docContentType,
//         } = await generateDocBuffer({ data, table });

//         return new NextResponse(docBuffer, {
//           status: 200,
//           headers: {
//             "Content-Type": docContentType,
//             "Content-Disposition": `attachment; filename="${docFileName}"`,
//           },
//         });
//       }

//       default:
//         return new NextResponse("Unsupported file type", { status: 400 });
//     }
//   } catch (error) {
//     return NextResponse.json({ status: 500, error: (error as Error).message });
//   }
// }
