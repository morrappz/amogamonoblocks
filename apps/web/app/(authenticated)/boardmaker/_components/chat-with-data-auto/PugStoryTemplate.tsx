/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { generatePugTemplate } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import { generateAIStory } from "./generateAIStory";

interface PugTemplateProps {
  data: string[];
  componentName: string;
}

const PugStoryTemplate = ({ data }: PugTemplateProps) => {
  const [loading, setLoading] = useState(false);
  const [aiStoryLoading, setAiStoryLoading] = useState(false);
  const [pugTemplate, setPugTemplate] = useState("");
  const [pugStory, setPugStory] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiStory, setAiStory] = useState("");

  const processTemplate = (template: string, dataItems: any): string => {
    try {
      const processedTexts = dataItems.map((dataItem: any) => {
        let result = template;

        // Remove `p |` patterns
        result = result.replace(/p\s*\|\s*/g, "");

        // Process if conditions
        result = result.replace(
          /if\s+([^\n]+)\n\s*([^if\n]+)/g,
          (match, condition, content) => {
            try {
              // Replace variables in the condition with actual values
              const processedCondition = condition.replace(
                /([a-zA-Z_][a-zA-Z0-9_]*)/g,
                (varName: string) => {
                  if (varName in dataItem) {
                    const value = dataItem[varName];
                    return typeof value === "string" ? `"${value}"` : value;
                  }
                  return varName;
                }
              );

              // Evaluate the condition
              return eval(processedCondition) ? content : "";
            } catch {
              return "";
            }
          }
        );

        // Replace placeholders with actual values
        result = result.replace(/#{([^}]+)}/g, (match, variable) => {
          const value = dataItem[variable.trim()];
          return value !== undefined && value !== null ? value.toString() : "";
        });
        // Clean and trim the text
        return result
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line)
          .join("\n");
      });

      // Combine all processed texts
      return processedTexts.join("\n\n");
    } catch (error) {
      console.error("Error processing template:", error);
      return "Error processing template.";
    }
  };

  const generateNarrative = (template: string) => {
    if (!template.trim()) {
      toast.error("Please enter a template");
      return;
    }

    if (!data || data.length === 0) {
      setPugStory("No data available.");
      return;
    }

    const result = processTemplate(template, data);
    setPugStory(result);
  };
  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (!data) {
        toast.error("Please enter required field");
      }
      const template = await generatePugTemplate(data);
      setLoading(false);
      setPugTemplate(template);
      generateNarrative(template);
    } catch (err) {
      toast.error("An error occurred while generating template");
      console.log(err);
      setLoading(false);
    }
  };

  const generateStory = async () => {
    try {
      setAiStoryLoading(true);
      if (!pugStory || !data) {
        toast.error("Please generate a template and data first");
        return;
      }
      const result = await generateAIStory(pugStory, aiPrompt);

      if (result) {
        setAiStory(result);
        setAiStoryLoading(false);
      } else {
        toast.error("An error occurred while generating AI story");
      }
    } catch (err) {
      toast.error("An error occurred while generating AI story");
      setAiStoryLoading(false);
      console.log(err);
    }
  };
  return (
    <div>
      <div className="flex justify-end mt-2 items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={!data || loading}
          onClick={handleGenerate}
        >
          <Wand2 className="w-4 h-4 mr-2 " />
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pugTemplate">.pug Template</Label>
        <CodeEditor
          id="pugTemplate"
          value={pugTemplate}
          placeholder="Enter your .pug template here..."
          language="pug"
          className="min-h-[200px] rounded-md"
        />
      </div>
      <div className="space-y-2 mt-5">
        <Label htmlFor="response">Pug Story</Label>

        <Textarea
          value={pugStory}
          className="min-h-[200px]"
          placeholder="Pug Story"
        />
      </div>
      <div className="space-y-2 mt-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="prompt">AI Story Prompt</Label>
          <Button
            variant="outline"
            size="sm"
            disabled={!data || !pugStory || aiStoryLoading || !aiPrompt}
            onClick={generateStory}
          >
            <Wand2 className="w-4 h-4 mr-2 " />
            {aiStoryLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
        <Textarea
          className="min-h-[100px]"
          id="prompt"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="Enter Prompt"
        />
      </div>
      <div className="space-y-2 mt-5">
        <Label htmlFor="response">AI Story</Label>
        <Textarea
          className="min-h-[200px]"
          id="response"
          value={aiStory}
          onChange={(e) => setAiStory(e.target.value)}
          placeholder="AI Story"
        />
      </div>
    </div>
  );
};

export default PugStoryTemplate;
