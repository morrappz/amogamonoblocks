import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import {
  TableDataProps,
  TableProps,
} from "@/components/chat/MenuItems/ShareMenu";

export function generateDoc({
  data,
  table,
}: {
  data: TableDataProps;
  table: TableProps;
}) {
  const headers = table?.headers || data?.tabs?.table?.headers;
  const rows = table?.rows || data?.tabs?.table?.rows;

  if (!headers || !Array.isArray(headers) || !Array.isArray(rows)) {
    console.error("Invalid data structure for DOC export");
    return;
  }

  // Sanitize rows: ensure each row has correct length
  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );

  // Create header row
  const headerRow = new TableRow({
    children: headers.map(
      (header) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: String(header), bold: true })],
            }),
          ],
        })
    ),
  });

  // Create data rows
  const dataRows = sanitizedRows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph(String(cell))],
            })
        ),
      })
  );

  // Create table
  const tabledata = new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data?.title ?? "Data Export",
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: data?.description ?? "", size: 24 }),
            ],
          }),
          new Paragraph({ text: "" }),
          tabledata,
        ],
      },
    ],
  });

  // Generate docx and save
  Packer.toBlob(doc).then((blob) => {
    const filename = `${data?.title ?? "Data"}.docx`;
    saveAs(blob, filename);
  });
}
