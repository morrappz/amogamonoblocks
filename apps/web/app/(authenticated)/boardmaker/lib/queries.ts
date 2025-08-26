import "server-only";

import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

export async function getRecords() {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select("*")
      .eq("form_group", "Board")
      .eq("business_number", session?.user?.business_number || "");

    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Error fetching forms", error);
    return [];
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

export async function getConnectionById(id: number) {
  try {
    const session = await auth();
    const { data, error } = await postgrest
      .from("form_connections")
      .select("*")
      .eq("id", id)
      .eq("business_number", session?.user?.business_number || "");

    if (error) throw error;
    return data;
  } catch (error) {
    console.log("Error fetching connection by id", error);
    return [];
  }
}

export async function getAnalyticAssistants() {
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select("*")
      .eq("form_group", "Analytic Assistant");
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}
