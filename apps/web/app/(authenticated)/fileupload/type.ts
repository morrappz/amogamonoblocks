import type { Tables } from "@/types/database";

export type FileUpload = Omit<Tables<"file_upload">, "status"> & {
  status: FileUploadStatus;
};

export type FileUploadStatus = "active" | "inactive" | "canceled";
export const FileUploadStatuses: [FileUploadStatus, ...FileUploadStatus[]] = [
  "active",
  "inactive",
  "canceled",
];

export interface FileUploadActions {
  file_upload_id: number;
  status: FileUploadStatus;
  created_date: Date;
  updated_date?: Date;
  file_name?: string;
  file_description?: string;
  file_publish_url?: string;
}

export type NewFileUpload = Omit<
  FileUploadActions,
  "created_date" | "updated_date"
>;

export type FileUploads = FileUpload[];
