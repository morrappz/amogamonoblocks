"use client";
import React, { useRef, useState } from "react";
import { form_json } from "../../../types/types";
import { Input } from "@/components/ui/input";
import { UploadAttachment } from "@/lib/minio";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const FileUpload = ({
  setInput,
  currentField,
}: {
  setInput: (value: string) => void;
  currentField: form_json;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files;
    if (!file) return;
    console.log("file-----", file);
    setFileData(file[0]?.name);
    setInput(file[0]?.name);
    const formData = new FormData();
    formData.append("file", file[0]);
    try {
      const response = await UploadAttachment({
        file: file[0],
        fileName: file[0]?.name,
      });
      if (!response.success) {
        toast.error("Error uploading file");
      } else {
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      toast.error("Error uploading file");
      throw error;
    }
  };

  return (
    <div>
      <span>{currentField.label}</span>
      <div>
        <Input
          type="file"
          accept=".xls,.xlsx,.pdf,.docx,.csv,.pptx"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <div className="bg-muted flex flex-col justify-center items-center min-h-[250px]">
          <div
            className="flex cursor-pointer flex-col items-center justify-center  text-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-7 h-7" />
            {fileData ? (
              <span>{fileData}</span>
            ) : (
              <div>
                <h1 className="font-semibold">Click to Upload</h1>
                <span className="text-muted-foreground text-sm">
                  PDF, CSV, XLS, XLSX, DOCX, PPTX
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
