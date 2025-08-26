/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/auth";
import { getErrorMessage } from "@/lib/handle-error";
import { postgrest } from "@/lib/postgrest";
import { revalidateTag, unstable_noStore } from "next/cache";

export async function createRecord(input: any) {
  unstable_noStore();
  try {
    const session = await auth();
    const { data, error } = await postgrest
      .from("form_setup")
      .insert([
        {
          ...input,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          created_date: new Date().toISOString(),
        },
      ])
      .select("form_id")
      .single();
    if (error) throw error;
    revalidateTag("form");
    revalidateTag("form-status-counts");
    return {
      data,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateRecord(input: any, formId: number) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .update(input)
      .eq("form_id", formId)
      .select("form_id")
      .single();
    if (error) throw error;
    revalidateTag("form");
    revalidateTag("form-status-counts");
    return {
      data,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function createFormFields(input: any) {
  const session = await auth();
  unstable_noStore();
  try {
    // const session = await auth();
    const { data, error } = await postgrest
      .from("form_fields")
      .insert([
        {
          ...input,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          created_date: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();
    if (error) throw error;
    revalidateTag("form");
    revalidateTag("form-status-counts");
    return {
      data,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function updateFormFields(input: any, formId: number) {
  unstable_noStore();
  try {
    const { data, error } = await postgrest
      .from("form_fields")
      .update(input)
      .eq("form_id", formId)
      .select("id")
      .single();
    if (error) throw error;
    revalidateTag("form");
    revalidateTag("form-status-counts");
    return {
      data,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function displayFormSetupData(input: { formId: number }) {
  try {
    const session = await auth();
    const { data, error } = await postgrest
      .from("form_fields")
      .select("*")
      .eq("form_id", input.formId)
      .eq("business_number", session?.user?.business_number || "");
    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Error fetching form setup data", error);
    return [];
  }
}

export async function getFormSetupData(input: { formId: string }) {
  try {
    // const session = await auth();
    const { data, error } = await postgrest
      .from("form_setup")
      .select("*")
      .eq("form_uuid", input.formId);
    // .eq("business_number", session?.user?.business_number || "");

    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Error fetching form setup data", error);
    return [];
  }
}

export async function createConnection(input: any) {
  try {
    const session = await auth();
    const { data, error } = await postgrest
      .from("form_connections")
      .insert([
        {
          ...input,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          created_date: new Date().toISOString(),
        },
      ])
      .select("id")
      .single();
    if (error) throw error;
    revalidateTag("form-connections");
    return { data };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function updateConnection(input: any, id: number) {
  try {
    // const session = await auth();
    const { data, error } = await postgrest
      .from("form_connections")
      .update(input)
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw error;
    revalidateTag("form-connections");
    return { data };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteConnection(id: number) {
  try {
    const { data, error } = await postgrest
      .from("form_connections")
      .delete()
      .eq("id", id);
    if (error) throw error;
    revalidateTag("form-connections");
    return { data, message: "Connection deleted successfully" };
  } catch (error) {
    console.log("Error deleting connection", error);
    return { data: false, error: getErrorMessage(error) };
  }
}

export async function getConnections() {
  try {
    const session = await auth();
    const { data, error } = await postgrest
      .from("form_connections")
      .select("*")
      .eq("business_number", session?.user?.business_number || "");

    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Error fetching connections", error);
    return [];
  }
}

export async function getUsers() {
  try {
    const { data, error } = await postgrest.from("user_catalog").select("*");
    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Error fetching users", error);
    return [];
  }
}

export async function getStoryTemplates() {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("story_template")
      .select("*")
      .eq("business_number", session?.user?.business_number || "");
    if (error) throw error;
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function saveToUserCatalog(payload) {
  try {
    const { data, error } = await postgrest
      .from("user_catalog")
      .insert(payload);
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    throw error;
  }
}
