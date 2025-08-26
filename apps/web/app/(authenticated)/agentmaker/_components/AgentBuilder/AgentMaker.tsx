import React, { Suspense } from "react";
import { FormFieldType } from "@/types/agentmaker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AgentsList from "./AgentsList";
import ConnectionsNew from "../Connections/ConnectionsNew";
import { getConnections, getRecords } from "../../lib/queries";

export interface Session {
  user: {
    name: string;
    email: string;
    id: string | number;
    business_number: string | number;
    business_name: string;
    first_name: string;
    last_name: string;
    business_postcode: string;
    roles: string;
    roles_json: string[];
  };
}

export type FormFieldOrGroup = FormFieldType | FormFieldType[];

export default async function AgentMaker() {
  const promises = await getRecords();
  const connections = await getConnections();

  return (
    <section className="p-2.5 space-y-8">
      <Tabs defaultValue="agents" className="pt-5 pr-5 pl-5">
        <div className="flex items-center justify-center">
          <TabsList className="grid items-center justify-center md:w-[400px] grid-cols-2">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="agents">
          <Suspense fallback={<div>Loading...</div>}>
            <AgentsList data={promises} />
          </Suspense>
        </TabsContent>
        <TabsContent value="connections">
          <Suspense fallback={<div>Loading...</div>}>
            <ConnectionsNew data={connections} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </section>
  );
}
