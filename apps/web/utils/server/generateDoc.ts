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

interface DOCXResult {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}

interface DocxOptions {
  table: {
    title: string;
    description: string;
    data: {
      headers: string[];
      rows: string[][];
    };
  };
  chart?: {
    title: string;
    description: string;
    chartData: {
      type: string;
      xAxis: string;
      yAxis: string;
      data: { label: string; value: number }[];
    };
  };
  story?: {
    title: string;
    description: string;
    data: string[];
  };
}

export async function generateDocBuffer({
  table,
  chart,
  story,
}: DocxOptions): Promise<DOCXResult> {
  const headers = table?.data?.headers;
  const rows = table?.data?.rows;

  if (!headers || !Array.isArray(headers) || !Array.isArray(rows)) {
    throw new Error("Invalid data structure for DOC export");
  }

  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );

  // Table section
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

  const tableSection = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const docSections: Paragraph[] | (Paragraph | Table)[] = [
    new Paragraph({
      children: [new TextRun({ text: table.title, bold: true, size: 28 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: table.description || "", size: 24 })],
    }),
    new Paragraph({ text: "" }),
    tableSection,
  ];

  // Chart section
  if (chart) {
    docSections.push(new Paragraph({ text: "" }));
    docSections.push(
      new Paragraph({
        children: [new TextRun({ text: chart.title, bold: true, size: 28 })],
      })
    );
    if (chart.description) {
      docSections.push(
        new Paragraph({
          children: [new TextRun({ text: chart.description, size: 24 })],
        })
      );
    }

    const chartHeaderRow = new TableRow({
      children: [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: chart.chartData.xAxis, bold: true }),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: chart.chartData.yAxis, bold: true }),
              ],
            }),
          ],
        }),
      ],
    });

    const chartDataRows = chart.chartData.data.map(
      (p) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(p.label))] }),
            new TableCell({ children: [new Paragraph(String(p.value))] }),
          ],
        })
    );

    const chartTable = new Table({
      rows: [chartHeaderRow, ...chartDataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    docSections.push(chartTable);
  }

  // Story section
  if (story) {
    docSections.push(new Paragraph({ text: "" }));
    docSections.push(
      new Paragraph({
        children: [new TextRun({ text: story.title, bold: true, size: 28 })],
      })
    );
    if (story.description) {
      docSections.push(
        new Paragraph({
          children: [new TextRun({ text: story.description, size: 24 })],
        })
      );
    }
    story.data.forEach((line) => {
      docSections.push(
        new Paragraph({ children: [new TextRun({ text: line, size: 22 })] })
      );
    });
  }

  const doc = new Document({
    sections: [{ children: docSections }],
  });

  const buffer = await Packer.toBuffer(doc);

  return {
    buffer,
    fileName: `${table.title || "data"}.docx`,
    contentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
}
