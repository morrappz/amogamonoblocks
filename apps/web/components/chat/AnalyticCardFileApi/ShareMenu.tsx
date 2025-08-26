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
  table: Table;
  chart: Chart;
  story: Story;
}

export interface Table {
  title: string;
  description: string;
  data: Data;
}

export interface Data {
  headers: string[];
  rows: string[][];
}

export interface Chart {
  title: string;
  description: string;
  data: Data2;
}

export interface Data2 {
  type: string;
  xAxis: string;
  yAxis: string;
  data: Daum[];
}

export interface Daum {
  label: string;
  value: number;
}

export interface Story {
  title: string;
  description: string;
  data: string[];
}

const ShareFileMenu = ({ data }: { data: TableDataProps }) => {
  const { table, chart, story } = data;
  const handleDownload = async (fileType: string) => {
    try {
      const payload = {
        fileType,
        table: table,
        chart: chart,
        story: story,
      };
      const response = await fetch("/api/chat/file", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Error downloading file");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const title = data?.chart?.title || "Untitled";
      link.href = url;
      link.setAttribute("download", `${title}.${fileType}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded");
    } catch (error) {
      toast.error(`Error ${error}`);
      throw error;
    }
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Ellipsis className="w-5 h-5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem
              //   onClick={() => generatePDF({ data, table })}
              onClick={() => handleDownload("pdf")}
            >
              <FileText className="w-5 h-5 text-muted-foreground" /> PDF API
            </DropdownMenuItem>
            <DropdownMenuItem
              //   onClick={() => generateXlsx({ data, table })}
              onClick={() => handleDownload("xlsx")}
            >
              <FileSpreadsheet className="w-5 h-5 text-muted-foreground" />{" "}
              Excel API
            </DropdownMenuItem>
            <DropdownMenuItem
              //   onClick={() => generateCsv({ data, table })}
              onClick={() => handleDownload("csv")}
            >
              <Sheet className="w-5 h-5 text-muted-foreground" /> CSV API
            </DropdownMenuItem>
            <DropdownMenuItem
              //   onClick={() => generateDoc({ data })}
              onClick={() => handleDownload("doc")}
            >
              <File className="w-5 h-5 text-muted-foreground" />
              DOC API
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Folder className="w-5 h-5 text-muted-foreground" />
              PPT API
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="w-5 h-5 text-muted-foreground" />
              Share API
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShareFileMenu;
