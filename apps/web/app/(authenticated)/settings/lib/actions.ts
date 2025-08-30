"use server";

import { postgrest } from "@/lib/postgrest";

interface ProfileSettingsData {
  first_name: string;
  last_name: string;
  user_email: string;
  account_status: "active" | "inactive";
  business_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export async function updateProfileSettings(
  data: ProfileSettingsData,
  userCatalogId: number | null
) {
  if (!userCatalogId) {
    throw new Error("User catalog ID is required");
  }

  try {
    // Only update fields that have values, excluding empty strings and null values
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Add fields only if they have non-empty values
    if (data.first_name?.trim()) updateData.first_name = data.first_name.trim();
    if (data.last_name?.trim()) updateData.last_name = data.last_name.trim();
    if (data.business_name?.trim())
      updateData.business_name = data.business_name.trim();
    if (data.address_1?.trim())
      updateData.business_address_1 = data.address_1.trim();
    if (data.address_2?.trim())
      updateData.business_address_2 = data.address_2.trim();
    if (data.city?.trim()) updateData.business_city = data.city.trim();
    if (data.state?.trim()) updateData.business_state = data.state.trim();
    if (data.postcode?.trim())
      updateData.business_postcode = data.postcode.trim();
    if (data.country?.trim()) updateData.business_country = data.country.trim();

    console.log("Updating user_catalog with data:", updateData);
    console.log("For user_catalog_id:", userCatalogId);

    const { error } = await postgrest
      .asAdmin()
      .from("user_catalog")
      .update(updateData)
      .eq("user_catalog_id", userCatalogId);

    if (error) {
      console.error("Database error:", error);
      throw new Error(
        `Failed to update profile: ${error.message || "Unknown database error"}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update profile");
  }
}
