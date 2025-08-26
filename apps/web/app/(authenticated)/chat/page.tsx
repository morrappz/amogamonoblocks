import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import Contacts from "./_components/Chat/TabPages/Contacts/Contacts";
import Groups from "./_components/Chat/TabPages/Groups/Groups";
import Chats from "./_components/Chat/TabPages/Chats/Chats";
import { getAgentsData, getContacts, getGroupsData } from "./lib/queries";
import RenderFormSetup from "./aichat/_components/RenderFormSetup";

export const metadata = {
  title: "Chat",
  description: "Chat with your contacts and groups",
};

const ChatPage = async () => {
  const contacts = await getContacts();
  const groups = await getGroupsData();
  const agents = await getAgentsData();
  return (
    <div className="w-full max-w-[800px] mx-auto p-4">
      <Tabs className="w-full" defaultValue="chats">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="chats">
          <Chats contacts={contacts} groups={groups} />
        </TabsContent>
        <TabsContent value="contacts">
          <Contacts contacts={contacts} />
        </TabsContent>
        <TabsContent value="groups">
          <Groups groups={groups} />
        </TabsContent>
        <TabsContent value="agents">
          <RenderFormSetup data={agents} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatPage;
