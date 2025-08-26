import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {} & appSessionUser;
    // user: {} & DefaultSession["user"];
  }

  interface User extends appSessionUser {}
}

export interface appSessionUser {
  user_catalog_id: number | null;
  first_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  avatar_url?: string | null;
  user_mobile?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  roles?: string | null;
  business_roles?: string | null;
  business_name?: string | null;
  business_number?: string | null;
  for_business_name?: string | null;
  for_business_number?: string | null;
  business?: string | null;
  password?: string;
  sessionType?: string | null;
  loged_in_business_number?: string | null;
  roles_json?: string[] | null;
  allowedPaths?: string[] | null;
}
