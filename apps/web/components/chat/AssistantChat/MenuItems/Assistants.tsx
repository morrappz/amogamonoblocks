"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bot, LoaderCircle } from "lucide-react";

import { getFormSetupData } from "@/app/(authenticated)/langchain-chat/lib/actions";
import Link from "next/link";

interface FormSetup {
  form_id: number;
  form_name: string;
  status: string;
  data_api_url: string;
  api_connection_json: string;
}

const Assistants = () => {
  const [assistant, setAssistant] = React.useState<FormSetup[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchAssistant = async () => {
      try {
        setLoading(true);
        const response = await getFormSetupData();
        setAssistant(response);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };
    fetchAssistant();
  }, []);
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-muted-foreground" />
            <span>Assistant</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" side="bottom" align="end">
          <DropdownMenuGroup className="max-h-[400px]  overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading Assistants...
                </span>
              </div>
            ) : assistant.length > 0 ? (
              assistant.map((item) => (
                <DropdownMenuItem className="bg-muted mb-2" key={item.form_id}>
                  <div className="flex justify-between w-full items-center">
                    <div className="overflow-ellipsis hover:scale-105 duration-300 ease-in-out flex-1">
                      <p className="max-w-[90%] overflow-ellipsis line-clamp-1">
                        <Link
                          href={`/langchain-chat/assistant/${item.form_id}`}
                        >
                          {item.form_name}
                        </Link>
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No Assistants available
                </p>
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Assistants;
