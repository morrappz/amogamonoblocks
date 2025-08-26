"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Activity,
  Bot,
  CheckCircle2,
  Code,
  MessageCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface DataProps {
  form_id: number;
  form_name: string;
  status: string;
  data_api_url: string;
  api_connection_json: string;
}

interface PageProps {
  data: DataProps[];
}

const RenderFormSetup = ({ data }: PageProps) => {
  const [inputValue, setInputValue] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((item) => {
      const searchTerm = inputValue.toLowerCase();
      return item.form_name.toLowerCase().includes(searchTerm);
    });
  }, [data, inputValue]);
  return (
    <div className="flex  mb-5 flex-col items-center h-full">
      <div className="border mt-5 rounded-md flex items-center w-full">
        <Search className="h-5 w-5 ml-2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="border-0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      <div className="w-full space-y-5  mt-5  gap-5">
        {filteredData.map((item) => (
          <Card key={item.form_id}>
            <CardContent className="flex p-2.5 flex-col">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Link href={`/chat/aichat/${item.form_id}`}>
                    <h2 className="font-semibold text-md">{item.form_name}</h2>
                  </Link>
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Code className="h-5 w-5" />
                  <span>ID: {item.form_id}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Status: </span>
                  <Badge variant="outline">
                    {item.status ? item.status : "unknown"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-5 w-5" />
                    <span>
                      Api Connection:{" "}
                      {item.data_api_url && item.api_connection_json
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/chat/aichat/${item.form_id}`}>
                      <MessageCircle className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredData?.length === 0 && (
        <div className="flex flex-col justify-center items-center mt-[10%] h-full w-full">
          <h2 className="text-xl font-semibold">No more results</h2>
          <p className="text-muted-foreground text-md">
            Try adjusting your search term
          </p>
        </div>
      )}
    </div>
  );
};

export default RenderFormSetup;
