/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  Loader,
  Mail,
  MapPin,
  Phone,
  Search,
} from "lucide-react";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  getGroupData,
  updateGroupData,
} from "@/app/(authenticated)/chat/lib/actions";

const AddUsers = ({
  chat_group_id,
  contacts,
}: {
  chat_group_id: string;
  contacts: any[];
}) => {
  const [group, setGroup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedContacts, setSelectedContacts] = useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroup = async () => {
      // const response = await axiosInstance.get(
      //   `${CHAT_GROUP_API}?chat_group_id=eq.${chat_group_id}`
      // );
      const response = await getGroupData(chat_group_id);
      if (response.length === 0) {
        toast.error("Group not found");
        return;
      }

      setGroup(response[0]);
    };
    fetchGroup();
  }, [chat_group_id, submitted]);

  const handleAddToGroup = async () => {
    try {
      setIsLoading(true);

      // Get the existing users from the group
      const existingUsers = group?.chat_group_users_json || [];

      // Create a map of existing user IDs to avoid duplicates
      const existingUserIds = new Map(
        existingUsers.map((user: any) => [user.user_catalog_id, true])
      );

      // Check if any selected contacts are already in the group
      const alreadyExistingUsers = selectedContacts.filter((contact: any) =>
        existingUserIds.has(contact.user_catalog_id)
      );

      // If there are already existing users, show a toast and return early
      if (alreadyExistingUsers.length > 0) {
        setIsLoading(false);
        toast.error(`User already exist in the group`);
        return;
      }

      // Filter out any selected contacts that are already in the group
      const newUsers = selectedContacts.filter(
        (contact: any) => !existingUserIds.has(contact.user_catalog_id)
      );

      // Combine existing users with new users
      const updatedUsers = [...existingUsers, ...newUsers];

      // const response = await axiosInstance.patch(
      //   `${CHAT_GROUP_API}?chat_group_id=eq.${chat_group_id}`,
      //   {
      //     chat_group_users_json: updatedUsers,
      //   }
      // );
      const response = await updateGroupData(chat_group_id, {
        chat_group_users_json: updatedUsers,
        user_group_list: updatedUsers.map((user) => user.user_group_list),
      });

      if (response) {
        setSubmitted(true);
        toast.success(`${newUsers.length} users added to group`);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Error adding user to group");
      console.log(error);
    }
  };

  return (
    <div className="w-full  ">
      <div className="flex justify-between  border-gray-200 pb-5 items-center">
        <h1 className="text-xl font-semibold">Add Users to Group</h1>

        <Button
          className="border-0"
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Groups
        </Button>
      </div>
      <div>
        {group && (
          <Card key={group.id}>
            <CardContent className="pt-2">
              <h1>{group.chat_group_name}</h1>
              <h1>Members: {group?.chat_group_users_json?.length}</h1>
              <div className="flex items-center justify-between">
                <h1>{group.status}</h1>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="mt-5">
        <div className="flex border rounded-md pl-4 items-center gap-1">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search contacts"
            className="border-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 mb-5">
        <p className="text-muted-foreground"></p>
      </div>
      {isLoading ? (
        <div>
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {contacts
            .filter((item: any) => {
              const searchTerm = search?.toLowerCase();
              return item.user_name?.toLowerCase().includes(searchTerm);
              //   item.business_name.toLowerCase().includes(searchTerm)
            })
            .map((item: any) => (
              <Card key={item.user_catalog_id} className="py-2 px-2">
                <CardContent className="space-y-[10px] px-2 py-2">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-md">{item.user_name}</h2>
                    <Checkbox
                      checked={
                        selectedContacts.includes(item) ||
                        group?.chat_group_users_json?.some(
                          (user: any) =>
                            user.user_catalog_id === item.user_catalog_id
                        )
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContacts([...selectedContacts, item]);
                        } else {
                          setSelectedContacts(
                            selectedContacts.filter(
                              (contact: any) =>
                                contact.user_catalog_id !== item.user_catalog_id
                            )
                          );
                        }
                      }}
                    />
                  </div>
                  <p className="text-md text-muted-foreground">
                    {item.designation}
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{item.user_email}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{item.user_mobile}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{item.business_postcode}</span>
                  </p>
                  <p className="flex items-center gap-2 text-md">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span>{item.department}</span>
                  </p>

                  <p className="text-md flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground stroke-[1.5]" />
                    <span>{item.business_name}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
      <div className="sticky  w-full flex justify-center items-center bottom-0 left-0 right-0 pt-4">
        <Button
          className="max-w-[800px] w-full"
          disabled={selectedContacts.length === 0 || isLoading}
          onClick={handleAddToGroup}
        >
          Add to Group
        </Button>
      </div>
    </div>
  );
};

export default AddUsers;
