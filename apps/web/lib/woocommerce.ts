/* eslint-disable */
import { auth } from "@/auth";
import { postgrest } from "./postgrest";

type WooCommerceRequestOptions = {
  method?: string;
  body?: any;
  cache?: number;
  customHeaders?: Record<string, string>;
  businessNumber?: string;
  configuration?: Record<string, string>;
};

type WooCommerceResponse = {
  success: boolean;
  data: any;
  error?: string;
  pages?: number;
};

const callWooCommerceAPI = async (
  url: string,
  {
    method = "GET",
    body,
    cache = 0,
    customHeaders,
    businessNumber,
    configuration,
  }: WooCommerceRequestOptions = {}
): Promise<WooCommerceResponse> => {
  try {
    const session = await auth();

    const userCatalogId = session?.user?.user_catalog_id;
    const userBusinessNumber = businessNumber || session?.user?.business_number;

    if (!userCatalogId || !userBusinessNumber) {
      return {
        success: false,
        data: null,
        error: "User session or business number is missing.",
      };
    }

    const { data: businessSettings, error: businessError } = await postgrest
      .from("business_settings" as any) // Temporarily cast to any to bypass TypeScript error
      .select("data_source_json, ai_provider_key")
      .eq("business_number", userBusinessNumber)
      .single();

    if (businessError || !businessSettings) {
      return {
        success: false,
        data: null,
        error: businessError?.message || "Failed to load business settings.",
      };
    }

    const woocommerceConfig = businessSettings.data_source_json?.find(
      (config: { platform_type: string }) =>
        config.platform_type === "woocommerce"
    );

    if (!woocommerceConfig) {
      return {
        success: false,
        data: null,
        error: "WooCommerce configuration not found.",
      };
    }

    const siteUrl =
      woocommerceConfig.credentials?.woocommerce?.site_url?.replace(/\/+$/, "");

    if (!siteUrl) {
      return {
        success: false,
        data: null,
        error: "Site URL is missing in WooCommerce credentials.",
      };
    }

    const consumerKey = woocommerceConfig.credentials.woocommerce.consumer_key;
    const consumerSecret =
      woocommerceConfig.credentials.woocommerce.consumer_secret;

    const authHeader = btoa(`${consumerKey}:${consumerSecret}`);

    const storeIntegration = configuration || {
      api_name: "growretails",
      base_url: `${siteUrl}/wp-json`,
      woo_consumer_key: consumerKey,
      woo_consumer_secret: consumerSecret,
      authorization: authHeader,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Basic ${storeIntegration.authorization}`,
      auth: "fdFSDFERfsdgd",
      ...(customHeaders || {}),
    };

    const fullUrl = `${storeIntegration.base_url}${url}`;
    const response = await fetch(fullUrl, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
      next: { revalidate: cache },
    });

    const responseText = await response.text();

    const isJson =
      responseText.trim().startsWith("{") ||
      responseText.trim().startsWith("[");
    const parsedData = isJson ? JSON.parse(responseText) : responseText;

    if (!response.ok) {
      console.error("Request failed", parsedData);
      return {
        success: false,
        data: parsedData,
        error: `Request failed with status ${response.status}`,
      };
    }

    const pages = response.headers.get("X-WP-TotalPages");

    return {
      success: true,
      data: parsedData,
      pages: pages ? parseInt(pages) : undefined,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || "Unknown error occurred.",
    };
  }
};

export default callWooCommerceAPI;
