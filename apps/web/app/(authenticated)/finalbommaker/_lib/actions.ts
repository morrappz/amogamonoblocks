"use server";

import { type FinalBom } from "../type";
import { revalidateTag, unstable_noStore } from "next/cache";
import type {
  CreateFinalBomSchema,
  UpdateFinalBomSchema,
} from "./validations";
import { postgrest } from "@/lib/postgrest";
import { getErrorMessage } from "@/lib/handle-error";
import { auth } from "@/auth";

export async function createRecord(
  input: CreateFinalBomSchema
) {
  unstable_noStore();
  try {
    const { ...rest } = input;
    const session = await auth();
    const { data, error } = await postgrest
      .from("final_bom")
      .insert([
        {
          ...rest,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          for_business_number: session?.user?.business_number || "",
          for_business_name: session?.user?.business_name || "",
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        },
      ])
      .select("final_bom_id")
      .single();
    
    if (error) throw error;
    
    revalidateTag("final_bom");
    revalidateTag("final_bom-status-counts");

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
  input: UpdateFinalBomSchema & { id: number }
) {
  unstable_noStore();
  try {
    const { id, ...rest } = input;

    const { data, error } = await postgrest
      .from("final_bom")
      .update({
        ...rest,
        updated_date: new Date().toISOString(),
      })
      .eq("final_bom_id", id)
      .select("status")
      .single();

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("final_bom");
    
    if (data?.status === input.status)
      revalidateTag("final_bom-status-counts");

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
  status?: FinalBom["status"];
}) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("final_bom")
      .update({
        status: input.status,
      })
      .in("final_bom_id", input.ids)
      .select("status");

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("final_bom");
    if (data?.some((r) => r.status === input.status))
      revalidateTag("final_bom-status-counts");

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
      .from("final_bom")
      .delete()
      .eq("final_bom_id", input.id);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("final_bom");
    revalidateTag("final_bom-status-counts");

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
      .from("final_bom")
      .delete()
      .in("final_bom_id", input.ids);

    if (error) throw error;

    // Revalidate cache/tags
    revalidateTag("final_bom");
    revalidateTag("final_bom-status-counts");

    return { data: null, error: null };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function saveFinalBom(
  input: {
    name: string;
    description?: string;
    data_upload_id: number;
    items: Record<string, string>[];
  }
) {
  unstable_noStore();

  try {
    const { name, description, data_upload_id, items } = input;
    const session = await auth();

    // Loop or bulk insert all items with shared metadata
    const rowsToInsert = items.map(item => ({
      ...item,
      name,
      description,
      data_upload_id,
      created_user_id: session?.user?.user_catalog_id,
      created_user_name: session?.user?.user_name || "",
      business_number: session?.user?.business_number || "",
      business_name: session?.user?.business_name || "",
      for_business_number: session?.user?.business_number || "",
      for_business_name: session?.user?.business_name || "",
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    }));

    const { data, error } = await postgrest
      .from("final_bom_item")
      .insert(rowsToInsert)
      .select("final_bom_id");

    if (error) throw error;

    revalidateTag("final_bom");
    revalidateTag("final_bom-status-counts");

    return {
      data,
      insertedCount: data?.length || 0,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}


