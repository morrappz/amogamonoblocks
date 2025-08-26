import * as XLSX from "xlsx";

interface XlsxOptions {
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

export function generateXlsxBuffer({ table, chart, story }: XlsxOptions): {
  buffer: Buffer;
  fileName: string;
  contentType: string;
} {
  const workbook = XLSX.utils.book_new();

  // 1. Table Sheet
  const headers = table.data.headers;
  const rows = table.data.rows;
  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );
  const tableSheetData = [
    [table.title],
    table.description ? [table.description] : [],
    [],
    headers,
    ...sanitizedRows,
  ];
  const tableSheet = XLSX.utils.aoa_to_sheet(tableSheetData);
  XLSX.utils.book_append_sheet(workbook, tableSheet, "Table");

  // 2. Chart Sheet
  if (chart) {
    const chartSheetData = [
      [chart.title],
      chart.description ? [chart.description] : [],
      [],
      [chart.chartData.xAxis, chart.chartData.yAxis],
      ...chart.chartData.data.map((point) => [point.label, point.value]),
    ];
    const chartSheet = XLSX.utils.aoa_to_sheet(chartSheetData);
    XLSX.utils.book_append_sheet(workbook, chartSheet, "Chart");
  }

  // 3. Story Sheet
  if (story) {
    const storySheetData = [
      [story.title],
      story.description ? [story.description] : [],
      [],
      ...story.data.map((line) => [line]),
    ];
    const storySheet = XLSX.utils.aoa_to_sheet(storySheetData);
    XLSX.utils.book_append_sheet(workbook, storySheet, "Story");
  }

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

  return {
    buffer,
    fileName: `${table.title || "Data"}.xlsx`,
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
