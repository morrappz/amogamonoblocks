"use client";
import React from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Step4 = ({
  template,
  setTemplate,
  prompt,
  setPrompt,
  response,
  setResponse,
  keywords,
}: {
  prompt: string;
  setPrompt: (prompt: string) => void;
  response: string;
  setResponse: (response: string) => void;
  template: string;
  setTemplate: (template: string) => void;
  keywords: string[];
}) => {
  const [loading, setLoading] = React.useState(false);
  const [storyGeneratedTime, setStoryGeneratedTime] = React.useState<Date>();

  const handleGenerateStory = async () => {
    if (!keywords.length) {
      toast.error("Please generate keywords first");
      return null;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/story-maker/generate-story", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (!result.success) {
        toast.error("Error generating story");
        return;
      }
      setResponse(result.story);
      setStoryGeneratedTime(new Date());
      setTemplate(result.story);
    } catch (error) {
      toast.error(`Error generating story ${error}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="m-2.5">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleGenerateStory}
          disabled={!prompt || loading}
          className="flex justify-end w-fit"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Code className="w-5 h-5" />
          )}
          {loading ? "Generating..." : "Generate Story"}
        </Button>
      </div>
      <div className="mb-2.5">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[150px]"
          placeholder="Enter prompt"
        />
      </div>
      <div className="mb-2.5">
        <div className="flex justify-between mb-1">
          <Label htmlFor="response">Response</Label>
          <Label htmlFor="response">
            Story Generated on: {storyGeneratedTime?.toLocaleTimeString()}
            {" , "}
            {storyGeneratedTime?.toDateString()}{" "}
          </Label>
        </div>
        <Textarea
          value={response}
          readOnly
          className="min-h-[300px]"
          placeholder="Enter response"
        />
      </div>
      <Label htmlFor="pugTemplate">Pug Template</Label>
      <CodeEditor
        id="pugTemplate"
        placeholder="Enter your .pug template here..."
        value={template}
        language="pug"
        onChange={(e) => setTemplate(e.target.value)}
        className="min-h-[300px] rounded-md"
      />
    </div>
  );
};

export default Step4;
