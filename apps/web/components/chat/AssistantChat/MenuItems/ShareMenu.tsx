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

const ShareFileMenu = ({ data }: { data: any[] }) => {
  // Transform customer data into table format for API
  const getTableFromData = (data: any[]) => {
    if (!Array.isArray(data) || data.length === 0)
      return { title: "Customers", data: { headers: [], rows: [] } };
    const headers = Object.keys(data[0]).filter(
      (key) => typeof data[0][key] !== "object" && !key.startsWith("_")
    );
    const rows = data.map((item) =>
      headers.map((header) => item[header] ?? "")
    );
    return {
      title: "Customers",
      data: {
        headers,
        rows,
      },
    };
  };

  const handleDownload = async (fileType: string) => {
    try {
      const payload = {
        fileType,
        data,
      };
      const response = await fetch("/api/chat/assistant-file", {
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
      link.href = url;
      link.setAttribute("download", `Customers.${fileType}`);
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
