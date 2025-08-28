"use client";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session, User, WeakPassword } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import supabaseClient from "@/lib/supabaseClient";
import { extractParamsFromUrl } from "@/utils/extractParamsFromUrl";
import { extractParamsFromQuery } from "@/lib/utils";
import { setSessionCookies, clearSessionCookies } from "@/lib/session-cookies";

interface AuthState {
  initialized: boolean;
  session: Session | null;
  tempLoginSession: Session | null;
  userCatalog: any | null;
  allowedPages: {
    page_name: string;
    page_link: string;
    page_icon_name?: string;
    page_icon_url?: string;
  }[];
  allowedPaths: string[];
  storeSettings: {
    store: Record<string, string>;
    woocommerce: {
      url: string;
      consumerKey: string;
      consumerSecret: string;
      pluginAuthKey: string;
    };
    ai: { provider: string; apiKey: string; model?: string };
  } | null;
  isFetchingUserInfo: boolean;
  refreshUserDataAndSettings: () => Promise<void>;
  signUp: (
    email: string,
    password: string
  ) => Promise<boolean | { user: User | null; session: Session | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<
    boolean | { user: User; session: Session; weakPassword?: WeakPassword }
  >;
  signOut: () => Promise<void>;
  getGoogleOAuthUrl: (redirectTo: string) => Promise<string | null>;
  setOAuthSession: (tokens: {
    access_token: string;
    refresh_token: string;
  }) => Promise<void>;
  setSession: Dispatch<SetStateAction<Session | null>>;
}

export const AuthContext = createContext<AuthState>({
  initialized: false,
  session: null,
  tempLoginSession: null,
  userCatalog: null,
  allowedPages: [],
  allowedPaths: [],
  storeSettings: null,
  isFetchingUserInfo: false,
  refreshUserDataAndSettings: async () => {},
  signUp: async () => false,
  signIn: async () => false,
  signOut: async () => {},
  getGoogleOAuthUrl: async () => "",
  setOAuthSession: async () => {},
  setSession: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [tempLoginSession, SetTempLoginSession] = useState<Session | null>(
    null
  );
  const [userCatalog, setUserCatalog] = useState<any | null>(null);
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);
  const [allowedPages, setAllowedPages] = useState<
    {
      page_name: string;
      page_link: string;
      page_icon_name?: string;
      page_icon_url?: string;
    }[]
  >([]);
  const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false);
  const [storeSettings, setSettings] = useState<any | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const publicRoutes = ["/supplier"];

  const fetchUserCatalogAndPermissions = useCallback(async (userId: string) => {
    setIsFetchingUserInfo(true);
    try {
      const [userRes, allowedPathsRes] = await Promise.all([
        supabaseClient
          .from("user_catalog")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabaseClient.rpc("get_allowed_paths", { user_uuid: userId }),
      ]);

      const { data: userRows, error: userError } = userRes;
      const { data: paths, error: allowedPathsError } = allowedPathsRes;

      if (userError || !userRows) {
        setUserCatalog(null);
        setAllowedPages([]);
        setAllowedPaths([]);
      } else {
        setUserCatalog(userRows);
        if (!paths || allowedPathsError) {
          setAllowedPages([]);
          setAllowedPaths([]);
        } else {
          setAllowedPages(paths);
          setAllowedPaths(
            paths.map((row: { page_link: string }) => row.page_link)
          );
        }
      }
    } finally {
      setIsFetchingUserInfo(false);
    }
  }, []);

  const refreshUserDataAndSettings = useCallback(async () => {
    if (!session?.user) {
      console.log("No active session, cannot refresh data.");
      return;
    }

    // Run both fetch operations in parallel for better performance
    await Promise.all([fetchUserCatalogAndPermissions(session.user.id)]);
    console.log("Refresh complete.");
  }, [session, fetchUserCatalogAndPermissions]);

  const signUp = async (
    email: string,
    password: string
  ): Promise<boolean | { user: User | null; session: Session | null }> => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error signing up:", error);
      return false;
    }

    if (data.session) {
      // setSession(data.session);
      SetTempLoginSession(data.session);
      console.log("User signed up:", data.user);
      return data;
    } else {
      console.log("No user returned from sign up");
    }
    return false;
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<
    boolean | { user: User; session: Session; weakPassword?: WeakPassword }
  > => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      return false;
    }

    if (data.session) {
      setSession(data.session);

      // Set cookies using server action for better reliability
      try {
        await setSessionCookies(
          data.session.access_token,
          data.session.refresh_token,
          data.session.user.id
        );
        console.log("Session cookies set via server action");
      } catch (error) {
        console.error(
          "Failed to set session cookies via server action:",
          error
        );

        // Fallback to client-side cookie setting
        if (typeof window !== "undefined") {
          const expires = new Date();
          expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

          document.cookie = `sb-access-token=${data.session.access_token};path=/;expires=${expires.toUTCString()};SameSite=Lax;Secure=${window.location.protocol === "https:"}`;
          document.cookie = `sb-refresh-token=${data.session.refresh_token};path=/;expires=${expires.toUTCString()};SameSite=Lax;Secure=${window.location.protocol === "https:"}`;
          document.cookie = `sb-user-id=${data.session.user.id};path=/;expires=${expires.toUTCString()};SameSite=Lax;Secure=${window.location.protocol === "https:"}`;

          console.log("Session cookies set via client-side fallback");
        }
      }

      console.log("User signed in:", data.user);
      return data;
    } else {
      console.log("No user returned from sign in");
      return false;
    }
  };

  const signOut = async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return;
    } else {
      // Clear session state immediately
      setSession(null);
      setUserCatalog(null);
      setAllowedPages([]);
      setAllowedPaths([]);

      // Clear session cookies using server action
      try {
        await clearSessionCookies();
        console.log("Session cookies cleared via server action");
      } catch (error) {
        console.error(
          "Failed to clear session cookies via server action:",
          error
        );

        // Fallback to client-side cookie clearing
        if (typeof window !== "undefined") {
          document.cookie =
            "sb-access-token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "sb-refresh-token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie =
            "sb-user-id=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
          console.log("Session cookies cleared via client-side fallback");
        }
      }

      console.log("User signed out");
    }
  };

  const getGoogleOAuthUrl = async (
    redirectTo: string
  ): Promise<string | null> => {
    const result = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });

    return result.data.url;
  };

  const setOAuthSession = async (tokens: {
    access_token: string;
    refresh_token: string;
  }) => {
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (error) throw error;
    setSession(data.session);
    //   setLoggedIn(data.session !== null);
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    setInitialized(true);
  }, []);

  // Fetch user catalog and permissions when session changes
  useEffect(() => {
    if (session && session.user) {
      refreshUserDataAndSettings();
    } else {
      setUserCatalog(null);
      setAllowedPages([]);
      setAllowedPaths([]);
    }
  }, [session, refreshUserDataAndSettings]);

  useEffect(() => {
    if (initialized) {
      // On web, check for tokens in the URL on the /authenticating page
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/authenticating"
      ) {
        let data = extractParamsFromUrl(window.location.href);
        if (!data.access_token || !data.refresh_token) {
          data = extractParamsFromQuery(window.location.href);
        }
        if (data.access_token && data.refresh_token) {
          setOAuthSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
          // Optionally, you can clean up the URL after processing
          window.history.replaceState({}, document.title, "/");
          return;
        }
      }

      const isPublic = publicRoutes.some((path) => pathname.startsWith(path));

      if (isPublic) return;

      // Define auth-related pages that should redirect to role-menu when logged in
      const authPages = ["/sign-in", "/sign-up", "/login", "/register"];
      const isAuthPage = authPages.some((page) => pathname.startsWith(page));

      // Handle root path redirection
      if (pathname === "/" && session) {
        console.log("Redirecting logged-in user from root to /role-menu");
        router.push("/role-menu");
        return;
      } else if (pathname === "/" && !session) {
        router.push("/sign-in");
        return;
      }

      // Only redirect authenticated users away from auth pages, or redirect unauthenticated users to sign-in
      if (session && isAuthPage) {
        // User is logged in but on an auth page, redirect to role-menu
        console.log("Redirecting logged-in user from auth page to /role-menu");
        router.push("/role-menu");
      } else if (!session && !isAuthPage && pathname !== "/sign-in") {
        // User is not logged in and not on an auth page, redirect to sign-in
        router.push("/sign-in");
      }
      // If user is logged in and on a non-auth page, let them stay there
    }
    // eslint-disable-next-line
  }, [initialized, session, pathname]);

  return (
    <AuthContext.Provider
      value={{
        initialized,
        session,
        tempLoginSession,
        signUp,
        signIn,
        signOut,
        getGoogleOAuthUrl,
        setOAuthSession,
        setSession,
        userCatalog,
        allowedPages,
        allowedPaths,
        isFetchingUserInfo,
        storeSettings,
        refreshUserDataAndSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
