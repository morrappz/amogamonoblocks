"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownZA,
  ArrowUpAZ,
  SlidersHorizontal,
  SquareMenu,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { Tables } from "@/types/database";
import { createNewChatSession } from "@/app/(authenticated)/langchain-chat/lib/actions";
import { toast } from "sonner";

export default function ClientRoleMenu({ pages_list }: { pages_list: any[] }) {
  const [sort, setSort] = useState("ascending");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handlePageClick = async (page: any, e: React.MouseEvent) => {
    // Check if this is the Langchain Chat page
    if (
      page.page_name === "Langchain Chat" &&
      page.page_link === "/langchain-chat/chat"
    ) {
      e.preventDefault(); // Prevent default Link navigation

      try {
        const result = await createNewChatSession();
        if (result.success) {
          // Navigate to the new chat
          router.push(`/langchain-chat/chat/${result.chatId}`);
        }
      } catch (error) {
        console.error("Failed to create new chat:", error);
        toast.error("Failed to create new chat session");
      }
    }
    // For all other pages, the Link component will handle navigation normally
  };

  // const filteredApps = pages
  //   .sort((a, b) => {
  //     const aName = a?.page_name ?? "";
  //     const bName = b?.page_name ?? "";
  //     return sort === "ascending"
  //       ? aName.localeCompare(bName)
  //       : bName.localeCompare(aName);
  //   })
  //   .filter((page) =>
  //     page?.page_name?.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  // console.log("filteredApps----", filteredApps);

  return (
    <>
      <div className="my-4 flex items-end justify-between sm:my-0 sm:items-center">
        <div className="flex flex-col gap-4 sm:my-4 sm:flex-row">
          <Input
            placeholder="Filter pages..."
            className="h-9 w-40 lg:w-[250px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-16">
            <SelectValue>
              <SlidersHorizontal size={18} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="ascending">
              <div className="flex items-center gap-4">
                <ArrowUpAZ size={16} />
                <span>Ascending</span>
              </div>
            </SelectItem>
            <SelectItem value="descending">
              <div className="flex items-center gap-4">
                <ArrowDownZA size={16} />
                <span>Descending</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="shadow" />
      <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {pages_list.map((page) => (
          <Link href={page.page_link || ""} key={page.page_name}>
            <li
              key={page.page_name}
              className="rounded-lg bg-card border p-4 hover:shadow-md"
              onClick={(e) => handlePageClick(page, e)}
            >
              <div className="mb-6 flex items-center justify-between">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg bg-muted p-2`}
                >
                  <SquareMenu className="text-primary" />
                </div>
              </div>
              <div>
                <h2 className="mb-1 text-sm">{page.page_name}</h2>
                <p className="line-clamp-2 text-gray-500">
                  {page.customtext_one}
                </p>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </>
  );
}
