"use client";
import React, { useRef, useState } from "react";
import { form_json } from "../../../types/types";
import { Input } from "@/components/ui/input";
import { UploadAttachment } from "@/lib/minio";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useFormStore } from "../lib/formStore";
import { Label } from "@/components/ui/label";

const ImageUpload = ({ form_json }: { form_json: form_json }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileData, setFileData] = useState("");
  const { updateFormData } = useFormStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files;
    if (!file) return;
    console.log("file-----", file);
    setFileData(file[0]?.name);
    updateFormData(form_json.name, file[0]?.name);
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
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <div>
        <Input
          type="file"
          accept=".jpg,.png"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <div className="bg-muted flex border-dashed border-black border-2 flex-col justify-center items-center min-h-[250px]">
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
                <span className="text-muted-foreground text-sm">JPG, PNG</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
