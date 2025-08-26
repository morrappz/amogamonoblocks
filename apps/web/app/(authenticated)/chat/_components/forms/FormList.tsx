"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { Message } from "./Forms";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FormList = ({
  messages,
  data,
  formFilled,
}: {
  messages: Message[];
  data: Record<string, string>;
  formFilled: boolean;
}) => {
  const { data: session } = useSession();
  const userName = session && session?.user?.user_name;
  return (
    <div className="h-full mt-5 pb-5 max-h-[80%]">
      <ScrollArea className="overflow-y-auto h-full">
        {messages.map((message) => (
          <div key={message.id} className="flex items-center gap-2.5 mb-2.5">
            <Avatar>
              {message.role === "user" ? (
                <AvatarFallback>{userName?.[0].toUpperCase()}</AvatarFallback>
              ) : (
                <AvatarFallback>
                  <Bot className="w-5 h-5 text-muted-foreground" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="bg-muted p-2.5 w-full rounded-md">
              {message.text}
            </div>
          </div>
        ))}
        <div className=" flex items-center justify-center w-full px-5">
          {data && Object.keys(data)?.length > 0 && formFilled && (
            <Table className="p-2.5 border rounded-md">
              <TableHeader>
                <TableRow>
                  {Object.keys(data).map((item, index) => (
                    <TableHead key={index}>{item}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {Object.values(data).map((item, index) => (
                    <TableCell key={index}>{item}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FormList;
