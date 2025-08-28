import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// Create server-side Supabase client with proper cookie handling
export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient(
    "https://supa.morr.biz",
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0MTU5MzMwMCwiZXhwIjo0ODk3MjY2OTAwLCJyb2xlIjoiYW5vbiJ9.o-PdMUC3XYEAbvKL_xxd73YYvohrtdZPSdpItQWqoOI",
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            // Supabase uses different cookie names, let's check all possible ones
            const cookieValue =
              cookieStore.get(key)?.value ||
              cookieStore.get(`sb-${key}`)?.value ||
              cookieStore.get(`supabase-auth-token`)?.value ||
              cookieStore.get(`supabase.auth.token`)?.value;
            return cookieValue || null;
          },
          setItem: (key: string, value: string) => {
            // Server-side storage is read-only, but we need this for the interface
          },
          removeItem: (key: string) => {
            // Server-side storage is read-only, but we need this for the interface
          },
        },
      },
    }
  );
}

// Get session from server-side
export async function getSupabaseSession() {
  try {
    const cookieStore = await cookies();

    // Debug: Log all cookies to see what's available
    const allCookies = cookieStore.getAll();

    // Look for Supabase session cookies with various naming patterns
    const possibleSessionCookies = allCookies.filter(
      (cookie) =>
        cookie.name.includes("supabase") ||
        cookie.name.includes("auth") ||
        cookie.name.includes("sb-") ||
        cookie.name.includes("access_token") ||
        cookie.name.includes("refresh_token")
    );

    // Try to find the Supabase auth session directly
    const authCookie = allCookies.find(
      (c) =>
        c.name === "sb-access-token" ||
        c.name === "supabase.auth.token" ||
        c.name === "sb-refresh-token" ||
        (c.name.startsWith("sb-") && c.name.includes("auth"))
    );

    const supabase = await createServerClient();

    // Try to get the session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
    }

    // If no session, try alternative method
    if (!session) {
      console.log("Trying alternative session method...");
      return await getSupabaseSessionAlternative();
    }

    return session;
  } catch (error) {
    console.error("Error in getSupabaseSession:", error);
    return null;
  }
}

// Alternative method: Try to reconstruct session from cookies
export async function getSupabaseSessionAlternative() {
  try {
    const cookieStore = await cookies();

    // Look for our manually set cookies
    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;
    const userId = cookieStore.get("sb-user-id")?.value;

    if (!accessToken || !refreshToken) {
      console.log("No manual session cookies found");
      return null;
    }

    // Create client and try to set session manually
    const supabase = createClient(
      "https://supa.morr.biz",
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0MTU5MzMwMCwiZXhwIjo0ODk3MjY2OTAwLCJyb2xlIjoiYW5vbiJ9.o-PdMUC3XYEAbvKL_xxd73YYvohrtdZPSdpItQWqoOI"
    );

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Error setting session from cookies:", error);
      return null;
    }

    if (data.session) {
      console.log("Session reconstructed from cookies successfully");
      return data.session;
    }

    return null;
  } catch (error) {
    console.error("Error in alternative session method:", error);
    return null;
  }
}

// Check if user is authenticated (simpler check)
export async function isAuthenticated() {
  try {
    const session = await getSupabaseSessionAlternative(); // Use alternative method first
    return !!session;
  } catch {
    return false;
  }
}

// Main function - try alternative method first since it's more reliable
export async function getSupabaseSessionMain() {
  // Try manual cookie method first
  const sessionFromCookies = await getSupabaseSessionAlternative();
  if (sessionFromCookies) {
    return sessionFromCookies;
  }

  // Fallback to automatic method
  return await getSupabaseSession();
}
