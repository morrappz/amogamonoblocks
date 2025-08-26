// utils/server/generateCsv.ts
import Papa from "papaparse";

interface CsvOptions {
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

export function generateCsvBuffer({ table, chart, story }: CsvOptions): Buffer {
  const { headers, rows } = table.data;

  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? "")
  );

  const csvSections: string[] = [];

  // 1. Table Section
  csvSections.push(`"${table.title}"`);
  if (table.description) csvSections.push(`"${table.description}"`);
  csvSections.push(Papa.unparse({ fields: headers, data: sanitizedRows }));

  // 2. Chart Section
  if (chart) {
    csvSections.push("");
    csvSections.push(`"${chart.title}"`);
    if (chart.description) csvSections.push(`"${chart.description}"`);
    const chartHeaders = [chart.chartData.xAxis, chart.chartData.yAxis];
    const chartRows = chart.chartData.data.map((p) => [p.label, p.value]);
    csvSections.push(Papa.unparse({ fields: chartHeaders, data: chartRows }));
  }

  // 3. Story Section
  if (story) {
    csvSections.push("");
    csvSections.push(`"${story.title}"`);
    if (story.description) csvSections.push(`"${story.description}"`);
    story.data.forEach((line) => {
      csvSections.push(`"${line}"`);
    });
  }

  // Join sections with two newlines between them
  const csvContent = csvSections.join("\n");

  return Buffer.from(csvContent, "utf-8");
}
