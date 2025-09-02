"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { deletePrompt, getPrompts } from "../lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptsList } from "../types/types";

const ReportSchedule = () => {
  const [prompts, setPrompts] = React.useState<PromptsList[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await getPrompts();
      if (!response.success) {
        toast.error("Error fetching Prompts");
      }
      setPrompts(response.data || []);
    } catch (error) {
      console.error("Error fetching Prompts:", error);
      toast.error(`Error fetching prompts: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const response = await deletePrompt(id);
      fetchPrompts();
      if (response.success) {
        toast.success("Prompt deleted successfully");
      } else {
        toast.error("Failed to delete prompt");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete prompt");
      throw error;
    }
  };

  return (
    <div>
      <div className="flex items-center w-full gap-2.5">
        <div className="border w-full rounded-lg flex items-center gap-2.5">
          <Search className="text-muted-foreground ml-3" />
          <Input placeholder="Search reports..." className="border-0" />
        </div>
        <Link href="/report-schedule/new">
          <Button size="icon">
            <Plus />
          </Button>
        </Link>
      </div>
      <div className="my-5">
        {isLoading ? (
          <div className="my-4 space-y-3">
            <Skeleton className="w-full h-[100px]" />
            <Skeleton className="w-full h-[100px]" />
            <Skeleton className="w-full h-[100px]" />
            <Skeleton className="w-full h-[100px]" />
          </div>
        ) : (
          prompts.map((prompt) => (
            <Card key={prompt.id} className=" my-3">
              <CardContent className="p-2.5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{prompt.title}</h2>
                    <Badge>{prompt.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                      {prompt.description}
                    </p>
                    <div className="flex items-center gap-2.5">
                      <Trash2
                        onClick={() => handleDelete(prompt.id)}
                        className="text-red-500 cursor-pointer h-5 w-5"
                      />
                      <Link href={`/report-schedule/edit/${prompt.id}`}>
                        <Edit className="w-5 h-5 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportSchedule;
