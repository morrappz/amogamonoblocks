"use client";

import { useEffect, useState } from "react";
import { getAnalyticAssistant } from "./actions";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Code,
  CheckCircle2,
  Activity,
  MessageCircle,
  Search,
} from "lucide-react";

export default function AnalyticAssistantPage() {
  const [assistants, setAssistants] = useState<Array<unknown>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const result = await getAnalyticAssistant();
        if (result.success && result.data) {
          setAssistants(result.data);
        }
      } catch (error) {
        console.error("Failed to load assistants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAssistants();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredAssistants = assistants.filter((assistant) =>
    assistant.form_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 space-y-4">
        <h1 className="text-xl font-bold tracking-tight">
          Your Analytic Assistants
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search assistants..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssistants.map((assistant) => (
          <Card key={assistant.form_id} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Link href={`/analyticassistant/${assistant.form_id}`}>
                      <h2 className="font-semibold text-md">
                        {assistant.form_name}
                      </h2>
                    </Link>
                    <Bot className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Code className="h-5 w-5" />
                    <span>ID: {assistant.form_id}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Status: </span>
                    <Badge variant="default">
                      {assistant.status ? assistant.status : "unknown"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="h-5 w-5" />
                      <span>Database Connected</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/analyticassistant/${assistant.form_id}`}>
                        <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAssistants.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600">
              No assistants found
            </h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm
                ? "Try adjusting your search term"
                : "You don't have access to any analytic assistants yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
