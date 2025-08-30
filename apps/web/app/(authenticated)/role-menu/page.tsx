import { Main } from "@/components/layout/main";
import { postgrest } from "@/lib/postgrest";
import ClientRoleMenu from "./client";

import { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Role Menu",
  description: "Access your work",
};

export default async function RoleMenu() {
  const session = await auth();

  if (!session) return <div>Not authenticated</div>;
  const { data: pages_list } = await postgrest.from("page_list").select("*");

  return (
    <div className="bg-background">
      <Main fixed>
        <div>
          <p className="text-muted-foreground">Access your work</p>
        </div>

        <ClientRoleMenu
          pages_list={
            pages_list?.filter((page) => {
              if (!page?.role_json && !Array.isArray(page.role_json)) {
                return false;
              }

              return (
                page?.role_json &&
                page.role_json.some((role: string) =>
                  session?.user?.roles_json?.includes(role)
                )
              );
            }) || []
          }
        />
      </Main>
    </div>
  );
}
