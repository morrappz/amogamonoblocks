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
import { useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { createMessage, getMessagesByAgentId } from "../../../lib/actions";

const ForwardMessagePage = ({
  id,
  contacts,
}: {
  id: number;
  contacts: any[];
}) => {
  const [message, setMessage] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();

  const [selectedContacts, setSelectedContacts] = useState<any>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        // const response = await axiosInstance.get(
        //   `${CHAT_MESSAGE_API}?agentMsgId=eq.${id}`
        // );
        const response = await getMessagesByAgentId(id);
        setMessage(response[0]);
      } catch (error) {
        toast.error(`Error fetching message: ${error}`);
      }
    };
    fetchMessage();
  }, [id]);

  const handleForwardMessage = async () => {
    try {
      setIsLoading(true);

      const generateRoomId = (id1: string | number, id2: string | number) => {
        return [id1, id2].sort().join("_");
      };

      // Create forward message promises for each selected contact
      const forwardPromises = selectedContacts.map(async (contact: any) => {
        const payload = {
          chat_message: message.chat_message,
          created_date: new Date().toISOString(),
          created_user_id: message.created_user_id,
          created_user_name: message.created_user_name,
          soc_room_id: generateRoomId(
            contact.user_catalog_id,
            session?.user?.user_catalog_id || ""
          ),
          // Forward specific fields
          is_forwared: true,
          forwared_by_user_id: message.created_user_id,
          selected_users: selectedContacts,
          forwared_message: message.chat_message,
          forwared_message_id: message.id,
          forwared_by_user_name: session?.user?.user_name || "",
          // If there are attachments, include them
          attachment_url: message.attachment_url || null,
          attachment_type: message.attachment_type || null,
          attachment_name: message.attachment_name || null,
          // Include any other necessary fields from the original message
          from_business_number: message.from_business_number,
          from_business_name: message.from_business_name,
        };

        // return axiosInstance.post(CHAT_MESSAGE_API, payload);
        return await createMessage(payload);
      });

      // Execute all forwards
      await Promise.all(forwardPromises);

      setSelectedContacts([]);
      setMessage([]);
      setSearch("");
      toast.success("Message forwarded successfully!");
      // Redirect back to chat
    } catch (error) {
      console.error(error);
      toast.error("Failed to forward message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full ">
      <div className="flex justify-between border-b border-gray-200 pb-5 items-center">
        <h1 className="text-xl font-semibold">Forward Message</h1>

        <Button
          className="border-0"
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Chat
        </Button>
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
        <p className="text-muted-foreground">
          Message to Forward: {message?.chat_message}{" "}
        </p>
      </div>
      {isLoading ? (
        <div>
          <Loader className="animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {contacts
            .filter((item: any) => {
              const searchTerm = search.toLowerCase();
              return item?.user_name?.toLowerCase().includes(searchTerm);
              //   item.business_name.toLowerCase().includes(searchTerm)
            })
            .map((item: any) => (
              <Card key={item.user_catalog_id} className="py-2 px-2">
                <CardContent className="space-y-[10px] px-2 py-2">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-md">{item.user_name}</h2>
                    <Checkbox
                      checked={selectedContacts.includes(item)}
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
      <div className="sticky w-full flex justify-center items-center bottom-0 left-0 right-0 pt-4">
        <Button
          className="max-w-[800px] w-full"
          disabled={selectedContacts.length === 0}
          onClick={handleForwardMessage}
        >
          Forward to {selectedContacts.length} contacts
        </Button>
      </div>
    </div>
  );
};

export default ForwardMessagePage;
