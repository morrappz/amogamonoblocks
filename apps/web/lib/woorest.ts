/* eslint-disable */
import { auth } from "@/auth";
import { postgrest } from "./postgrest";

const woorest = async (
  url: string,
  method: string = "GET",
  body?: any,
  cache?: number,
  custom_headers?: Record<string, string>,
  business_number?: string,
  configuration?: Record<string, string>
): Promise<any> => {
  const session = await auth();

  if (!session?.user?.user_catalog_id) {
    throw new Error("didnt find user sesssion");
  }

  const { data: businessSettings, error: businessError } = await postgrest
    .from("business_settings")
    .select("data_source_json, ai_provider_key")
    .eq("business_number", session?.user?.business_number)
    .single();

  if (businessError || !businessSettings) {
    throw new Error(
      businessError?.message || "Failed to load business settings."
    );
  }

  const woocommerceConfig = businessSettings.data_source_json?.find(
    (config: { platform_type: string }) =>
      config.platform_type === "woocommerce"
  );

  if (!woocommerceConfig) {
    throw new Error("No WooCommerce configuration found.");
  }

  const siteUrl: string =
    woocommerceConfig.credentials.woocommerce.site_url.replace(/\/+$/, "");

  const store_integratiogn = configuration || {
    api_name: "growretails",
    base_url: siteUrl + "/wp-json",
    woo_consumer_key: woocommerceConfig.credentials.woocommerce.consumer_key,
    woo_consumer_secret:
      woocommerceConfig.credentials.woocommerce.consumer_secret,
    authorization: btoa(
      woocommerceConfig.credentials.woocommerce.consumer_key +
        ":" +
        woocommerceConfig.credentials.woocommerce.consumer_secret
    ),
  };

  // console.log("store_integratiogn", store_integratiogn);

  if (!store_integratiogn) {
    console.error("thier is no store integration data", business_number);
  }

  const default_headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Basic ${store_integratiogn.authorization}`,
  };

  const options: RequestInit = {
    method,
    headers: custom_headers
      ? { ...default_headers, ...custom_headers }
      : default_headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
    // cache: cache ? cache : "no-store",
    next: { revalidate: cache ? cache : 0 },
  };

  const response = await fetch(`${store_integratiogn.base_url}${url}`, options);

  const responseBody = await response.text();
  console.log("request url:", `${store_integratiogn.base_url}${url}`);
  console.log("response.body =", responseBody);

  // console.log("response",response.body)
  if (!response.ok) {
    console.error(
      "response error url",
      response.url,
      "response.body",
      responseBody
    );
    throw new Error(responseBody);
    // return `HTTP error! Status: ${response.status}`;
  }

  // Check if the response body is not empty before attempting to parse as JSON
  if (responseBody.trim() !== "") {
    try {
      return JSON.parse(responseBody);
    } catch (error) {
      console.error("Error parsing response as JSON:", error);
      return responseBody;
    }
  } else {
    console.error("Empty response body");
    return null; // You can choose to return something else or throw an error
  }
};

export default woorest;
