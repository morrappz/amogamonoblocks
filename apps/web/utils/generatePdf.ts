import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { toast } from "sonner";
import {
  TableDataProps,
  TableProps,
} from "@/components/chat/MenuItems/ShareMenu";

// import fonts for pdf
pdfMake.vfs = pdfFonts.vfs;

export function generatePDF({
  data,
  table,
}: {
  data: TableDataProps;
  table: TableProps;
}) {
  const title = data?.title || "Untitled";
  const description = data?.description || "";

  const headers = table?.headers || data?.tabs?.table?.headers || [];
  const rows = table?.rows || data?.tabs?.table?.rows || [];
  // check if the table data is valid and has data or not
  if (!Array.isArray(headers) || headers.length === 0) {
    console.error("Missing or invalid headers");
    toast.error("Missing or invalid headers");
    return;
  }

  // Filter out any rows that are not arrays or don't match header length
  const sanitizedRows = rows.filter(
    (row) => Array.isArray(row) && row.length === headers.length
  );

  const body = [headers, ...sanitizedRows];
  console.log("body-----", body);

  const docDefinition = {
    content: [
      { text: title || "Untitled", style: "header" },
      { text: description || "", style: "subheader" },
      {
        table: {
          headerRows: 1,
          widths: headers.map(() => "*"),
          body: body,
        },
        layout: "lightHorizontalLines",
        margin: [0, 10, 0, 0],
      },
    ],

    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 14,
        margin: [0, 0, 0, 10],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
}
