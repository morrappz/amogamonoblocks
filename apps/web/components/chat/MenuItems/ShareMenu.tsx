"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateCsv } from "@/utils/generateCsv";
import { generateDoc } from "@/utils/generateDoc";
import { generatePDF } from "@/utils/generatePdf";
import { generateXlsx } from "@/utils/generateXlsx";
import {
  Ellipsis,
  File,
  FileSpreadsheet,
  FileText,
  Folder,
  Share,
  Sheet,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";

export interface TableDataProps {
  title: string;
  description: string;
  tabs: Tabs;
}

export interface Tabs {
  table: Table;
  chart: Chart;
}

export interface Table {
  headers: string[];
  rows: string[][];
}

export interface Chart {
  type: string;
  xAxis: string;
  yAxis: string;
  data: Daum[];
}

export interface Daum {
  label: string;
  value: number;
}

export interface TableProps {
  headers: string[];
  rows: string[][];
}

const ShareMenu = ({
  data,
  table,
}: {
  data: TableDataProps;
  table: TableProps;
}) => {
  // const handleDownload = async (fileType: string) => {
  //   try {
  //     const payload = {
  //       fileType: fileType,
  //       data: data,
  //       table: table,
  //     };
  //     const response = await fetch("/api/chat/file", {
  //       method: "POST",
  //       body: JSON.stringify(payload),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     console.log("respnonse----", response);
  //     if (!response.ok) {
  //       toast.error("Error downloading file");
  //       return;
  //     }
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     const title = data?.title || "Untitled";
  //     link.href = url;
  //     link.setAttribute("download", `${title}.${fileType}`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(url);
  //     toast.success("File downloaded");
  //   } catch (error) {
  //     toast.error(`Error ${error}`);
  //     throw error;
  //   }
  // };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis className="w-5 h-5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => generatePDF({ data, table })}
              // onClick={() => handleDownload("pdf")}
            >
              <FileText className="w-5 h-5 text-muted-foreground" /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => generateXlsx({ data, table })}
              // onClick={() => handleDownload("xlsx")}
            >
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />{" "}
              Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => generateCsv({ data, table })}
              // onClick={() => handleDownload("csv")}
            >
              <Sheet className="w-5 h-5 text-muted-foreground" /> CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => generateDoc({ data, table })}
              // onClick={() => handleDownload("doc")}
            >
              <File className="w-5 h-5 text-muted-foreground" />
              DOC
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Folder className="w-5 h-5 text-muted-foreground" />
              PPT
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="w-5 h-5 text-muted-foreground" />
              Share
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShareMenu;
