import {
  TableDataProps,
  TableProps,
} from "@/components/chat/MenuItems/ShareMenu";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { toast } from "sonner";

export function generateCsv({
  data,
  table,
}: {
  data?: TableDataProps;
  table?: TableProps;
}) {
  const headers = table?.headers || data?.tabs?.table?.headers;
  const rows = table?.rows || data?.tabs?.table?.rows;
  const title = `${data?.title || "Data"}.csv`;

  if (!Array.isArray(headers) || !Array.isArray(rows)) {
    toast.error("Invalid table structure");
    throw new Error("Invalid table structure");
  }

  // get row data based on header index
  const sanitizedRows = rows.map((row) => {
    return headers.map((_, i) => row?.[i] ?? "");
  });

  const csv = Papa.unparse({
    fields: headers,
    data: sanitizedRows,
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, title);
}
