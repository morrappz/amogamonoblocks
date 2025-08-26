"use server";

import { type DataUpload } from "../type";
import { revalidateTag, unstable_noStore } from "next/cache";
import type {
  CreateDataUploadSchema,
  UpdateDataUploadSchema,
} from "./validations";
import { postgrest } from "@/lib/postgrest";
import { getErrorMessage } from "@/lib/handle-error";
import { UploadAttachment } from "@/lib/minio";

export async function createRecord(
  input: CreateDataUploadSchema & { file?: File }
) {
  unstable_noStore();
  try {
    const { file, ...rest } = input;

    if (file) {
      const result = await UploadAttachment({
        file: file,
        fileName: input?.file_name || file.name,
        folderName: `data_upload/${rest.data_upload_group}`,
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      rest.file_url = result.url;
    }

    const { data, error } = await postgrest
      .from("data_upload")
      .insert([
        {
          ...rest,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        },
      ])
      .select("data_upload_id")
      .single();

    if (error) throw error;

    revalidateTag("data_upload");
    revalidateTag("data_upload-status-counts");

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
  input: UpdateDataUploadSchema & { id: number; file?: File }
) {
  unstable_noStore();
  try {
    const { id, file, ...rest } = input;

    if (file) {
      const result = await UploadAttachment({
        file: file,
        fileName: file.name,
        folderName: "dataupload",
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      rest.file_url = result.url;
    }

    const { data, error } = await postgrest
      .from("data_upload")
      .update({
        ...rest,
        updated_date: new Date().toISOString(),
      })
      .eq("data_upload_id", id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("data_upload");
    if (data?.status === input.status)
      revalidateTag("data_upload-status-counts");

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
  status?: DataUpload["status"];
}) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("data_upload")
      .update({
        status: input.status,
      })
      .in("data_upload_id", input.ids)
      .select("status");

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("data_upload");
    if (data?.some((r) => r.status === input.status))
      revalidateTag("data_upload-status-counts");

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
    const { data: uploadData, error: fetchError } = await postgrest
      .from("data_upload")
      .select("file_uuid, template_id, data_table_name")
      .eq("data_upload_id", input.id)
      .single();

    if (fetchError) throw fetchError;

    if (uploadData?.file_uuid && uploadData?.data_table_name) {
      const { error: dataError } = await postgrest
        .asAdmin()
        // @ts-expect-error - dynamic table name
        .from(uploadData.data_table_name)
        .delete()
        .eq("file_uuid", uploadData.file_uuid);

      if (dataError) throw dataError;
    }

    const { error } = await postgrest
      .from("data_upload")
      .delete()
      .eq("data_upload_id", input.id);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("data_upload");
    revalidateTag("data_upload-status-counts");

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
    const { data: uploadData, error: fetchError } = await postgrest
      .from("data_upload")
      .select("file_uuid, template_id, data_table_name")
      .in("data_upload_id", input.ids);

    if (fetchError) throw fetchError;

    const groupedData = uploadData?.reduce((acc, item) => {
      if (item.data_table_name && item.file_uuid) {
        if (!acc[item.data_table_name]) {
          acc[item.data_table_name] = [];
        }
        acc[item.data_table_name].push(item.file_uuid);
      }
      return acc;
    }, {} as Record<string, string[]>);

    for (const [tableName, fileUuids] of Object.entries(groupedData)) {
      const { error: dataError } = await postgrest
        .asAdmin()
        // @ts-expect-error - dynamic table name
        .from(tableName)
        .delete()
        .in("file_uuid", fileUuids);

      if (dataError) throw dataError;
    }

    const { error } = await postgrest
      .from("data_upload")
      .delete()
      .in("data_upload_id", input.ids);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("data_upload");
    revalidateTag("data_upload-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function quickUpdateRecord(
  input: { status?: DataUpload["status"] } & { id: number }
) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("data_upload")
      .update({
        status: input.status,
      })
      .eq("data_upload_id", input.id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("data_upload");

    return { data: data, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
