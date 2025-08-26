"use server";

import { type Product } from "../type";
import { revalidateTag, unstable_noStore } from "next/cache";
import type {
  CreateProductSchema,
  UpdateProductSchema,
  QuickUpdateProductSchema,
} from "./validations";
import { postgrest } from "@/lib/postgrest";
import { getErrorMessage } from "@/lib/handle-error";
import { UploadAttachment } from "@/lib/minio";
import { auth } from "@/auth";

export async function createRecord(
  input: CreateProductSchema & { file?: File }
) {
  unstable_noStore();
  try {
    const session = await auth();
    
    if (input.file) {
      const result = await UploadAttachment({
        file: input.file,
        fileName: input.file.name,
      });
      if (!result.success)
        throw new Error(result.error || "File upload failed.");
      
      input.product_small_image_link = result.url;
      delete input.file; // Removes the property
    }
    
    const { data, error } = await postgrest
      .from("product")
      .insert([
        {
          ...input,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          for_business_number: session?.user?.business_number || "",
          for_business_name: session?.user?.business_name || "",
          product_group: "items",
          created_date: new Date().toISOString()
        },
      ])
      .select("product_id")
      .single();

    if (error) throw error;

    revalidateTag("product");
    revalidateTag("products-status-counts");

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
  input: UpdateProductSchema & { id: number; file?: File }
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
      
      input.product_small_image_link = result.url;
      delete input.file; // Removes the property
    }

    const { id, ...rest } = input;
    
    const { data, error } = await postgrest
      .from("product")
      .update({
        ...rest,
        product_id: id,
        updated_date: new Date().toISOString(),
      })
      .eq("product_id", input.id)
      .select("status")
      .single();

    if (error) {
      console.log(error);
      throw error;
    }

    // Revalidate cache/tags
    revalidateTag("product");
    if (data?.status === input.status) revalidateTag("products-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function quickUpdateRecord(
  input: QuickUpdateProductSchema & { id: number }
) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("product")
      .update({
        status: input.status,
      })
      .eq("product_id", input.id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("product");
    if (data?.status === input.status) revalidateTag("products-status-counts");

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
  status?: Product["status"];
}) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("product")
      .update({
        status: input.status,
      })
      .in("product_id", input.ids)
      .select("status");

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("product");
    if (data?.some((r) => r.status === input.status))
      revalidateTag("products-status-counts");

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
      .from("product")
      .delete()
      .eq("product_id", input.id);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("product");
    revalidateTag("products-status-counts");

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
      .from("product")
      .delete()
      .in("product_id", input.ids);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("product");
    revalidateTag("products-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
