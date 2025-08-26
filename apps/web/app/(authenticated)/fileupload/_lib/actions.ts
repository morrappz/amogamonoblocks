"use server";

import { type FileUpload } from "../type";
import { revalidateTag, unstable_noStore } from "next/cache";
import type {
  CreateFileUploadSchema,
  UpdateFileUploadSchema,
} from "./validations";
import { postgrest } from "@/lib/postgrest";
import { getErrorMessage } from "@/lib/handle-error";
import { UploadAttachment } from "@/lib/minio";

export async function createRecord(
  input: CreateFileUploadSchema & { file?: File }
) {
  unstable_noStore();
  try {
    const { file, ...rest } = input;

    if (file) {
      const result = await UploadAttachment({
        file: file,
        fileName: file.name,
        folderName: "fileupload",
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      rest.file_publish_url = result.url;
    }

    const { data, error } = await postgrest
      .from("file_upload")
      .insert([
        {
          ...rest,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        },
      ])
      .select("file_upload_id")
      .single();

    if (error) throw error;

    revalidateTag("file_upload");
    revalidateTag("file_upload-status-counts");

    return {
      data,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateRecord(
  input: UpdateFileUploadSchema & { id: number; file?: File }
) {
  unstable_noStore();
  try {
    const { id, file, ...rest } = input;

    if (file) {
      const result = await UploadAttachment({
        file: file,
        fileName: file.name,
        folderName: "fileupload",
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      rest.file_publish_url = result.url;
    }

    const { data, error } = await postgrest
      .from("file_upload")
      .update({
        ...rest,
        updated_date: new Date().toISOString(),
      })
      .eq("file_upload_id", id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("file_upload");
    if (data?.status === input.status)
      revalidateTag("file_upload-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateRecords(input: {
  ids: number[];
  status?: FileUpload["status"];
}) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("file_upload")
      .update({
        status: input.status,
      })
      .in("file_upload_id", input.ids)
      .select("status");

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("file_upload");
    if (data?.some((r) => r.status === input.status))
      revalidateTag("file_upload-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteRecord(input: { id: number }) {
  unstable_noStore();
  try {
    const { error } = await postgrest
      .from("file_upload")
      .delete()
      .eq("file_upload_id", input.id);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("file_upload");
    revalidateTag("file_upload-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function deleteRecords(input: { ids: number[] }) {
  unstable_noStore();
  try {
    const { error } = await postgrest
      .from("file_upload")
      .delete()
      .in("file_upload_id", input.ids);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("file_upload");
    revalidateTag("file_upload-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
