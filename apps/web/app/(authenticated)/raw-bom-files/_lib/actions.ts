"use server";

import { type MyDoc } from "../type";
import { revalidateTag, unstable_noStore } from "next/cache";
import type { CreateMyDocSchema, UpdateMyDocSchema } from "./validations";
import { postgrest } from "@/lib/postgrest";
import { getErrorMessage } from "@/lib/handle-error";
import { UploadAttachment } from "@/lib/minio";

export async function createRecord(input: CreateMyDocSchema & { file?: File }) {
  unstable_noStore();
  try {
    if (input.file) {
      const result = await UploadAttachment({
        file: input.file,
        fileName: input.file.name,
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      input.shareurl = result.url;
    }

    const { data, error } = await postgrest
      .from("mydocs")
      .insert([
        {
          status: input.status,
          doc_name: input.doc_name,
          shareurl: input.shareurl,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        },
      ])
      .select("mydoc_id")
      .single();

    if (error) throw error;

    revalidateTag("mydocs");
    revalidateTag("mydoc-status-counts");

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
  input: UpdateMyDocSchema & { id: number; file?: File }
) {
  unstable_noStore();
  try {
    if (input.file) {
      const result = await UploadAttachment({
        file: input.file,
        fileName: input.file.name,
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      input.shareurl = result.url;
    }

    const { data, error } = await postgrest
      .from("mydocs")
      .update({
        status: input.status,
        doc_name: input.doc_name,
        shareurl: input.shareurl,
        updated_date: new Date().toISOString(),
      })
      .eq("mydoc_id", input.id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("mydocs");
    if (data?.status === input.status) revalidateTag("mydoc-status-counts");

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
  status?: MyDoc["status"];
}) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("mydocs")
      .update({
        status: input.status,
      })
      .in("mydoc_id", input.ids)
      .select("status");

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("mydocs");
    if (data?.some((mydoc) => mydoc.status === input.status))
      revalidateTag("mydoc-status-counts");

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
      .from("mydocs")
      .delete()
      .eq("mydoc_id", input.id);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("mydocs");
    revalidateTag("mydoc-status-counts");

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
      .from("mydocs")
      .delete()
      .in("mydoc_id", input.ids);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("mydocs");
    revalidateTag("mydoc-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
