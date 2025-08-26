"use server";

import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

interface FormData {
  [field: string]: string | number;
}

export async function createFormData(
  payload: FormData,
  formId: number,
  formName: string,
  formUuid: string
) {
  const session = await auth();
  try {
    const { data, error } = await postgrest.from("form_data").insert({
      created_user_id: session?.user?.user_catalog_id,
      created_user_name: session?.user?.user_name,
      created_date: new Date().toISOString(),
      business_name: session?.user?.business_name,
      business_number: session?.user?.business_number,
      form_data: payload,
      form_id: formId,
      form_name: formName,
      form_code: formUuid,
    });
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    return { error, success: false };
  }
}
