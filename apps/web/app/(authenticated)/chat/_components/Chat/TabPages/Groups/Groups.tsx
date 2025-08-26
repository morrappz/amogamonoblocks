/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Eye, MessageCircle, Plus, Search, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LuCopyCheck } from "react-icons/lu";
import { toast } from "sonner";

const Groups = ({ groups }: { groups: any[] }) => {
  const [search, setSearch] = useState("");
  const [groupsList, setGroupsList] = useState<any[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const filteredData = groups.filter(
          (group: any) =>
            group.created_user_id == session?.user?.user_catalog_id ||
            group.chat_group_users_json?.some(
              (user: any) =>
                user.user_catalog_id == session?.user?.user_catalog_id
            )
        );
        setGroupsList(filteredData);
      } catch (error) {
        toast.error(`Error fetching groups: ${error}`);
      }
    };
    fetchGroups();
  }, [session, groups]);

  return (
    <div>
      <div className="flex items-center mt-5 gap-2 justify-between">
        <div className="flex items-center border rounded-md w-full pl-4 gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Groups"
            className="border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href={"/chat/groups/new"}>
          <Button size={"icon"}>
            <Plus />
          </Button>
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {groupsList
          .filter((item: any) =>
            item.chat_group_name.toLowerCase().includes(search.toLowerCase())
          )
          .map((group: any) => (
            <Card key={group.chat_group_id}>
              <CardContent className="pt-2">
                <h1>{group.chat_group_name}</h1>

                <h1>Members: {group?.chat_group_users_json?.length}</h1>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2">
                    <LuCopyCheck className="h-5 w-5 text-muted-foreground" />
                    {group.status}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/chat/groups/add-users/${group.chat_group_id}`}
                    >
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </Link>
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <Link href={`/chat/groups/edit/${group.chat_group_id}`}>
                      <Edit className="h-5 w-5 text-muted-foreground" />
                    </Link>
                    <Link href={`/chat/groups/messages/${group.chat_group_id}`}>
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default Groups;
