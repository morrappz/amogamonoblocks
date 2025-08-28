"use server";

import { postgrest } from "@/lib/postgrest";
import IpAddress from "./IPAddress";
import getCurrentBrowser from "./getCurrentBrowser";
import {
  getSupabaseSession,
  getSupabaseSessionMain,
} from "@/lib/supabase-server";

// import getUserOS from "./getCurrentOS";
// import getUserLocation from "./geoLocation";

export async function saveUserLogs(payload) {
  const session = await getSupabaseSessionMain();
  const payloadData = {
    ...payload,
    user_ip_address: await IpAddress(),
    browser: getCurrentBrowser(),
    user_id: session?.user?.user_catalog_id,
    user_name: session?.user?.user_name,
    user_email: session?.user?.user_email,
    user_mobile: session?.user?.user_mobile,
    session_id: session?.user?.user_catalog_id,
    for_business_name: session?.user?.business_name,
    for_business_number: session?.user?.business_number,
    // device: getUserOS(),
    // geo_location: await getUserLocation(),
    // operating_system: getUserOS(),
  };
  try {
    const { data, error } = await postgrest
      .from("user_log")
      .insert(payloadData);
    if (error) throw error;
    console.log("here==================", data);
    return { data, success: true };
  } catch (error) {
    console.error("error==============", error);
    throw error;
  }
}
