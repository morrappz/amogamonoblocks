"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@radix-ui/react-progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";
import { UpdateFinalBomSchema } from "../../_lib/validations";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Template = {
  data_upload_id: number;
  file_name: string;
  model_name: string;
  variant_name: string;
  data_combination_json: Record<string, string>;
};

type UploadStatus = "idle" | "uploading" | "processing" | "done" | "error";

interface UploadError {
  message: string;
  code?: string;
}

export default function Step4({
  form,
  selectedTemplate,
  finalBomData,
  onComplete,
}: {
  form: UseFormReturn<UpdateFinalBomSchema>;
  selectedTemplate: Template | undefined;
  finalBomData: Record<string, string>[] | undefined;
  onComplete?: (success: boolean) => void;
}) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [failedRows, setFailedRows] = useState<
    { row: number; error: string; data: Record<string, unknown> }[]
  >([]);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(
    null
  );

  const [finalBomName, setFinalBomName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleUploadError = (error: unknown) => {
    setUploadStatus("error");
    const errorMessage =
      (error as { message?: string }).message || "Upload failed";
    const errorCode = (error as { code?: string }).code;
    setUploadError({
      message: errorMessage,
      code: errorCode,
    });
    console.log("uploadError", uploadError);
    toast.error(errorMessage);
  };

  const handleSave = async () => {
    if (!finalBomData || finalBomData.length === 0) {
      toast.error("No data to upload");
      return;
    }

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadErrorMessage(null);

    if (onComplete) {
      onComplete(true);
    }

    try {
      // Upload data
      const response = await axios
        .post(
          "/api/final-bom-data/upload",
          {
            bom_name: finalBomName,
            bom_item_description: description,
            data_upload_id: selectedTemplate?.data_upload_id ?? 0,
            items: finalBomData,
          },
          {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total!) * 100
              );
              setUploadProgress(progress);
              if (progress === 100) {
                setUploadStatus("processing");
              }
            },
          }
        )
        .catch((error) => {
          return error.response;
        });

      const { success, insertedCount, totalItems, error, errors } =
        response.data;
      if (!success) {
        setUploadStatus("error");
        if (errors?.length) setFailedRows(errors);
        toast.error(error || "Upload failed");
        if (error) {
          setUploadErrorMessage(error);
        }
      } else {
        setUploadStatus("done");
        toast.success("Upload successful");
        setIsSaved(true);
        setSuccessMessage(
          `Uploaded ${insertedCount} records out of ${totalItems} records successfully.`
        );
        // Force refresh the page data
        router.refresh();
      }

      if (onComplete) {
        onComplete(success);
      }
    } catch (error: unknown) {
      handleUploadError(error);
    } finally {
      setIsUploading(false);

      if (onComplete) {
        onComplete(uploadStatus === "done");
      }
    }
  };

  const handleDownloadFailLogs = () => {
    function convertJSONToCSV(jsonData: Record<string, unknown>[]) {
      // Extract keys from the first object to create the header row
      const headers = Object.keys(jsonData[0]).join(",") + "\n";

      // Map each object to a row of values
      const rows = jsonData
        .map((obj) => Object.values(obj).join(","))
        .join("\n");

      // Combine header and rows
      return headers + rows;
    }

    // Create CSV content
    const csvContent = convertJSONToCSV(failedRows.map((row) => row.data));

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "FailLogs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 w-full">
      <h2 className="text-xl font-bold">Finalize BOM</h2>
      {form && (
        <>
          <div className="space-y-2">
            <FormField
              control={form.control}
              name="bom_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Final BOM Name</FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      placeholder="Model Final BOM Name"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setFinalBomName(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormField
              control={form.control}
              name="bom_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Final BOM Description</FormLabel>
                  <FormControl>
                    <Input
                      className="resize-none"
                      placeholder="Model Final BOM Description"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setDescription(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm font-medium">
                {uploadStatus === "uploading"
                  ? `Uploading ${uploadProgress}%`
                  : uploadStatus === "processing"
                  ? "Processing data..."
                  : uploadStatus === "done"
                  ? "Complete"
                  : uploadStatus === "error"
                  ? "Failed"
                  : "Ready"}
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>

          {uploadStatus === "error" && failedRows.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Errors</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{failedRows.length} rows failed</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadFailLogs}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Errors
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {uploadErrorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{uploadErrorMessage} </span>
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "done" && (
            <Alert className="border-green-600 text-green-600 [&>svg]:text-green-600">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>{successMessage}</AlertTitle>
            </Alert>
          )}

          <Button
            onClick={handleSave}
            className="w-full"
            disabled={
              isUploading ||
              isSaved ||
              !finalBomData ||
              !finalBomData.length ||
              !(uploadStatus === "idle" || uploadStatus === "error")
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadStatus === "processing"
                  ? "Processing..."
                  : "Uploading..."}
              </>
            ) : (
              "Save Model Final BOM"
            )}
          </Button>
        </CardContent>
      </Card>

      {isSaved && (
        <div className="mt-4 space-y-4">
          <div className="bg-green-100 text-green-700 p-3 rounded-md flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5" />
            BOM saved successfully!
          </div>

          {/* <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-4">
            <Button variant="outline" className="w-64"
            onClick={() => {
              form.reset();
              //setCurrentStep(0);
              setRawBomCount(0);
              setFinalBomData(undefined); 
              setSelectedTemplate?.(undefined);
              location.href = "/model-final-bom-maker"
            }}>
              ← Back to Model Model Final BOM Maker
            </Button>
            <Button
              className="w-64 bg-black text-white"
              onClick={() => setCurrentStep(4)} // ← move to Step 5
            >
              ✔ Validate BOM
            </Button>
          </div> */}
        </div>
      )}
    </div>
  );
}
