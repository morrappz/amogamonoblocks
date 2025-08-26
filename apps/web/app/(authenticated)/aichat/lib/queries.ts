import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import "server-only";

export async function getFormSetupData() {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select("form_id,form_name,status,data_api_url,api_connection_json")
      .filter("users_json", "cs", `["${session?.user?.user_email}"]`);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}
