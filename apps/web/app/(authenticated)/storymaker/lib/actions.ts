/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth } from "@/auth";
import { CREATE_TEMPLATE_API } from "@/constants/envConfig";
import { postgrest } from "@/lib/postgrest";
import { revalidateTag, unstable_noStore } from "next/cache";

export async function createStoryMaker(data: any) {
  unstable_noStore();
  const {
    story_title,
    story_description,
    selected_template,
    // metricsGroup,
    status,
    userDefinedColumns,
    keywords,
    story,
    selectedStoryGroup,
    userDefinedMetricScope,
    pug_template_prompt,
    pug_template_promt_response,
    pug_template,
    story_json,
  } = data;
  try {
    const session = await auth();

    const { data, error } = await postgrest
      .from("story_template")
      .insert([
        {
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name || "",
          business_number: session?.user?.business_number || "",
          business_name: session?.user?.business_name || "",
          for_business_number: session?.user?.business_number || "",
          for_business_name: session?.user?.business_name || "",
          created_date: new Date().toISOString(),
          story_title: story_title || "",
          story_description: story_description || "",
          story_group: selected_template || "",
          status: status || "",
          userdefined_table_column_json: userDefinedColumns || "",
          table_column_json: selectedStoryGroup || "",
          keyword_extract_metric_json: keywords || "",
          story_extract_metric_json: story || "",
          userdefined_extract_metric_scope_json: userDefinedMetricScope || "",
          story_api_url: `https://y0gcskgkwwgwkkooscoso8sg.219.93.129.146.sslip.io/story_template?story_title=eq.${story_title}`,
          pug_template_prompt: pug_template_prompt || "",
          pug_template_prompt_response: pug_template_promt_response || "",
          pug_template_json: pug_template || "",
          story_json: story_json || "",
        },
      ])
      .select("story_id");

    if (error) throw error;

    revalidateTag("story_template");
    revalidateTag("story_template-status-counts");

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      error: `Failed to create story maker ${error}`,
    };
  }
}

export async function updateStoryMaker(data: any) {
  unstable_noStore();
  const {
    story_title,
    story_description,
    selected_template,
    // metricsGroup,
    status,
    userDefinedColumns,
    keywords,
    story,
    selectedStoryGroup,
    story_id,
    pug_template_prompt,
    pug_template_prompt_response,
    story_json,
    pug_template,
  } = data;
  try {
    const { data, error } = await postgrest
      .from("story_template")
      .update({
        story_title: story_title || "",
        story_description: story_description || "",
        story_group: selected_template || "",
        status: status || "",
        userdefined_table_column_json: userDefinedColumns || "",
        table_column_json: selectedStoryGroup || "",
        keyword_extract_metric_json: keywords || "",
        story_extract_metric_json: story || "",
        story_api_url: `https://y0gcskgkwwgwkkooscoso8sg.219.93.129.146.sslip.io/story_template?story_title=eq.${story_title}`,
        pug_template_prompt: pug_template_prompt || "",
        pug_template_prompt_response: pug_template_prompt_response || "",
        pug_template: pug_template,
        pug_template_json: pug_template,
        story_json: story_json || "",
      })
      .eq("story_id", story_id)
      .select("story_id")
      .single();

    if (error) throw error;

    revalidateTag("story_template");
    revalidateTag("story_template-status-counts");
    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      error: `Failed to create story maker ${error}`,
    };
  }
}

export async function createTemplate(story_title: string, template: string) {
  try {
    const response = await fetch(`${CREATE_TEMPLATE_API}/${story_title}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
      },
      body: JSON.stringify({
        template: template,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to create template");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("error---------", error);
    throw error;
  }
}
