"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  CheckCircle2,
  Edit,
  LayoutPanelTop,
  Plus,
  Search,
} from "lucide-react";
import React, { useState } from "react";
import { NewStoryMaker } from "./NewStoryMaker";
import { StoryData, StoryGroup } from "../types/types";
import { Card, CardContent } from "@/components/ui/card";

const StoryMaker = ({
  storyTemplates,
  storyTemplateData,
}: {
  storyTemplates: StoryGroup[];
  storyTemplateData: StoryData[];
}) => {
  // const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [rowAction, setRowAction] = useState<string>("");
  const [selectedStory, setSelectedStory] = useState<StoryData | null>(null);
  return (
    <div className="max-w-[800px] w-full mx-auto p-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center w-full border rounded-md">
          <Search className="h-5 w-5 text-muted-foreground mx-3" />
          <Input
            type="text"
            placeholder="Search..."
            className="border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          size="icon"
          onClick={() => {
            // setOpen(true);
            setRowAction("new");
          }}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-4 mt-5 w-full">
        {storyTemplateData
          .filter((item) => {
            const searchTerm = search.toLowerCase();
            return item?.story_title?.toLowerCase().includes(searchTerm);
          })
          .sort((a, b) => {
            return (
              new Date(b.created_date).getTime() -
              new Date(a.created_date).getTime()
            );
          })
          .map((item) => (
            <Card key={item.story_id} className="py-2 px-2">
              <CardContent className="space-y-[10px] px-2 py-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-md">{item.story_title}</h2>
                </div>

                <p className="flex items-center gap-2 text-md">
                  <LayoutPanelTop className="h-5 w-5 text-muted-foreground" />
                  <span> {item.story_group}</span>
                </p>
                <p className="flex items-center gap-2 text-md">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span> {item.status}</span>
                </p>
                <div className="flex justify-between items-center">
                  <p className="flex items-center gap-2 max-w-[80%] text-md">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {new Date(item.created_date).toLocaleDateString()}
                    </span>
                  </p>

                  <div className="flex gap-1.5 md:gap-2 space-x-2">
                    {/* <Eye className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground" /> */}
                    <Edit
                      onClick={() => {
                        setRowAction("edit");
                        setSelectedStory(item);
                      }}
                      className="h-5 w-5 text-muted-foreground stroke-[1.5] cursor-pointer hover:text-foreground"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      <NewStoryMaker
        open={rowAction === "new" || rowAction === "edit"}
        isNew={rowAction === "new"}
        onOpenChange={() => {
          // setOpen(false);
          setRowAction("");
        }}
        storyTemplates={storyTemplates}
        selectedStory={selectedStory}
        rowAction={rowAction}
      />
    </div>
  );
};

export default StoryMaker;
