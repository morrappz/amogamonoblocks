import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";
import "server-only";

export async function getStoryTemplates() {
  try {
    const { data, error } = await postgrest
      .from("data_group")
      .select("*")
      .in("data_group_type", ["Story Group"])
      .not("data_group_name", "is", null);
    if (error) throw error;
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getStoryTemplateData() {
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
