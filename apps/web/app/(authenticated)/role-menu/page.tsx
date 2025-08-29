import { Main } from "@/components/layout/main";
import { postgrest } from "@/lib/postgrest";
import ClientRoleMenu from "./client";

import { Metadata } from "next";
import {
  getServerAuth,
  getSupabaseSession,
  getSupabaseSessionMain,
} from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Role Menu",
  description: "Access your work",
};

export default async function RoleMenu() {
  const { session, allowedPages, userCatalog } = await getServerAuth();

  if (!session) return <div>Not authenticated</div>;

  return (
    <div className="bg-background">
      <Main fixed>
        <div>
          <p className="text-muted-foreground">Access your work</p>
        </div>

        <ClientRoleMenu pages_list={allowedPages} />
      </Main>
    </div>
  );
}
