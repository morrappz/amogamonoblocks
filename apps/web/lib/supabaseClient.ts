import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://supa.morr.biz";
const supabaseAnonKey =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc0MTU5MzMwMCwiZXhwIjo0ODk3MjY2OTAwLCJyb2xlIjoiYW5vbiJ9.o-PdMUC3XYEAbvKL_xxd73YYvohrtdZPSdpItQWqoOI";

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => {
        if (typeof window !== "undefined") {
          // Try localStorage first
          const item = localStorage.getItem(key);
          if (item) {
            return item;
          }

          // Fallback to cookies
          const cookieItem = getCookie(key);
          if (cookieItem) {
          }
          return cookieItem;
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== "undefined") {
          // Store in localStorage
          localStorage.setItem(key, value);

          // Also store in cookies for server-side access
          setCookie(key, value, 7); // 7 days expiry
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(key);
          deleteCookie(key);
        }
      },
    },
    // Add additional auth options
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Cookie helper functions
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export default supabaseClient;
