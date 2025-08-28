import { Main } from "@/components/layout/main";
import { postgrest } from "@/lib/postgrest";
import ClientRoleMenu from "./client";

import { Metadata } from "next";
import {
  getSupabaseSession,
  getSupabaseSessionMain,
} from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Role Menu",
  description: "Access your work",
};

export default async function RoleMenu() {
  const session = await getSupabaseSessionMain();
  console.log("session------", session);
  if (!session) return <div>Not authenticated</div>;
  const { data: pages_list } = await postgrest.from("page_list").select("*");

  const pages = [
    {
      id: 1,
      app_name: "amogaappz",
      page_icon_name: "User",
      page_link: "/login-block",
      page_name: "Login",
    },
    {
      id: 2,
      app_name: "amogaappz",
      page_icon_name: "User",
      page_link: "/signup-block",
      page_name: "Signup",
    },
    {
      id: 3,
      app_name: "amogaappz",
      page_icon_name: "User",
      page_link: "/table-list",
      page_name: "Table List",
    },
    {
      id: 4,
      app_name: "amogaappz",
      page_icon_name: "House",
      page_link: "/cards-list",
      page_name: "Cards List",
    },
    {
      id: 5,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/cards",
      page_name: "Cards",
    },
    {
      id: 6,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/store-page-with-filters",
      page_name: "Store page with Filters",
    },
    {
      id: 7,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/cart",
      page_name: "Cart",
    },
    {
      id: 8,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/tabs",
      page_name: "Tabs",
    },
    {
      id: 8,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/home-header",
      page_name: "Home Header",
    },
    {
      id: 9,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/forms",
      page_name: "Forms",
    },
    {
      id: 10,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/user-billing",
      page_name: "User Billing",
    },
    {
      id: 11,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/blog",
      page_name: "Blog",
    },
    {
      id: 12,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/services",
      page_name: "Services",
    },
    {
      id: 13,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/top-bar",
      page_name: "Top Bar",
    },
    {
      id: 14,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/gallery",
      page_name: "Gallery",
    },
    {
      id: 15,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/dashboard",
      page_name: "Dashboard",
    },
    {
      id: 16,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/stats",
      page_name: "Stats",
    },
    {
      id: 17,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/teams",
      page_name: "Teams",
    },
    {
      id: 18,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/help",
      page_name: "Help",
    },
    {
      id: 19,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/tab-filters",
      page_name: "Tab Filters",
    },
    {
      id: 20,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/buttons",
      page_name: "Buttons",
    },
    {
      id: 21,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/ai-prompt",
      page_name: "AI Prompt",
    },
    {
      id: 22,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/own-gpt",
      page_name: "Own GPT",
    },
    {
      id: 22,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/my-gpt",
      page_name: "My GPT",
    },
    {
      id: 23,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/store-settings",
      page_name: "Store Settings",
    },
    {
      id: 24,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/langchain-chat/chat",
      page_name: "Langchain Chat",
    },
    {
      id: 25,
      app_name: "amogaappz",
      page_icon_name: "Mail",
      page_link: "/langchain/msg-logs",
      page_name: "Langchain AI Chat Msg logs",
    },
  ];

  return (
    <div className="bg-background">
      <Main fixed>
        <div>
          <p className="text-muted-foreground">Access your work</p>
        </div>

        <ClientRoleMenu
          // pages_list={
          //   pages_list?.filter((page) => {
          //     if (!page?.role_json && !Array.isArray(page.role_json)) {
          //       return false;
          //     }

          //     return (
          //       page?.role_json &&
          //       page.role_json.some((role: string) =>
          //         session?.user?.roles_json?.includes(role)
          //       )
          //     );
          //   }) || []
          // }
          pages_list={pages}
        />
        {/* <Input placeholder="Filter pages" className="h-9 w-40 lg:w-[250px]" />
        {pages_list.map((page, index) => (
          <div key={index} className="grid mt-5  grid-cols-3">
            <Card>
              <CardContent>{page}</CardContent>
            </Card>
          </div>
        ))} */}
      </Main>
    </div>
  );
}
