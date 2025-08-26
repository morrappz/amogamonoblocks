"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { StoryJsonItem } from "../NewStoryMaker";

const Step5 = ({
  storyJson,
  setStoryJson,
}: {
  storyJson: StoryJsonItem[] | null;
  setStoryJson: (json: StoryJsonItem[] | null) => void;
}) => {
  // Keep track of raw input
  const [rawInput, setRawInput] = React.useState(() => {
    if (!storyJson) return "";
    try {
      return JSON.stringify(storyJson, null, 2);
    } catch (error) {
      toast.error(`Error ${error}`);
      return "";
    }
  });

  // Update raw input and attempt to parse JSON
  const handleJsonChange = (value: string) => {
    setRawInput(value);

    if (!value.trim()) {
      setStoryJson(null);
      return;
    }

    // Only attempt to parse if the input looks like valid JSON
    if (value.trim().startsWith("[") && value.trim().endsWith("]")) {
      try {
        const parsedJson = JSON.parse(value);
        if (Array.isArray(parsedJson)) {
          setStoryJson(parsedJson);
        }
      } catch (error) {
        toast.error(`Error ${error}`);
        throw error;
        // Silently fail while typing - we'll validate on next/save
      }
    }
  };

  return (
    <div className="m-2.5">
      <div className="mb-2.5">
        <Label htmlFor="story-json">Story JSON</Label>
        <Textarea
          id="story-json"
          value={rawInput}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="min-h-[300px] font-mono"
          placeholder={`Enter JSON array like:
            [
              {
                "name": "example",
                "type": "type",
                "queries": [],
                "description": "description"
              }
            ]`}
        />
      </div>
    </div>
  );
};

export default Step5;
