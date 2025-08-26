import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  TableDataProps,
  TableProps,
} from "@/components/chat/MenuItems/ShareMenu";

export function generateXlsx({
  data,
  table,
}: {
  data: TableDataProps;
  table: TableProps;
}) {
  const headers = table?.headers || data?.tabs?.table?.headers;
  const rows = table?.rows || data?.tabs?.table?.rows;

  if (!headers || !Array.isArray(headers) || !Array.isArray(rows)) {
    toast.error("Invalid data format");
    throw Error("Invalid Data Format");
  }

  const sanitizedRows = rows.map((row) =>
    headers.map((_, i) => row?.[i] ?? [])
  );

  const worksheetData = [headers, ...sanitizedRows];
  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Save to file
  const title = `${data?.title ?? "Data"}.xlsx`;
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, title);
}
