/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";

type DataItem = {
  [key: string]: string | number | boolean | null;
};

interface NarrativeTemplateProps {
  data: DataItem[];
  componentName: any;
}

const NarrativeTemplate: React.FC<NarrativeTemplateProps> = ({
  data,
  componentName,
}) => {
  const { storyApiEnabled, storyApi } = componentName;
  console.log("componentName----", storyApiEnabled, storyApi);
  const [narrativeData, setNarrativeData] = useState<string>("");
  const [narrativeApiData, setNarrativeApiData] = useState<string>("");
  const [template, setTemplate] = useState<string>("");
  const [templateApi, setTemplateApi] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const processTemplate = (template: string, dataItems: DataItem[]): string => {
    console.log("1-----", template, dataItems);
    try {
      const processedTexts = dataItems.map((dataItem) => {
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
        console.log("result----", result);
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

  const generateNarrative = () => {
    if (!template.trim()) {
      toast.error("Please enter a template");
      return;
    }

    if (!data || data.length === 0) {
      setNarrativeData("No data available.");
      return;
    }

    const result = processTemplate(template, data);
    setNarrativeData(result);
  };

  const generateApiNarrative = async () => {
    try {
      setIsLoading(true);
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic YWRtaW46cGFzc3dvcmQxMjM=",
        },
      };

      const response = await fetch(storyApi, requestOptions);
      const dataResponse = await response.json();
      if (!response.ok) {
        toast.error("Failed to fetch data from API");
        return;
      }
      setIsLoading(false);
      if (!dataResponse || dataResponse.length === 0) {
        toast.error("No data available.");
        return;
      }
      setTemplateApi(dataResponse.template);
      const result = processTemplate(dataResponse.template, data);
      setNarrativeApiData(result);
    } catch (error) {
      console.log("error----", error);
      toast.error("Failed to fetch data from API");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <div className="space-y-2 mt-2">
          <div className="flex items-center justify-between">
            <Label>Data Story</Label>
            <Button onClick={generateNarrative}>
              <Wand2 className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </div>
          <Textarea value={narrativeData} readOnly className="min-h-[200px]" />
        </div>
        <div className="space-y-2">
          <Label>Data Story Template</Label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="min-h-[200px]"
            placeholder="Paste your template here..."
          />
        </div>
        <div className="space-y-2">
          <Label>Metrics Story</Label>
          <Textarea readOnly className="min-h-[200px]" />
        </div>
        <div className="space-y-2">
          <Label>Metrics Story Template</Label>
          <Textarea
            className="min-h-[200px]"
            placeholder="Paste your template here..."
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Api Data Story</Label>
            <Button
              onClick={generateApiNarrative}
              disabled={isLoading || !storyApiEnabled}
            >
              <Wand2 className="h-4 w-4 mr-1" />
              {isLoading ? "Generating" : "Generate"}
            </Button>
          </div>
          <Textarea
            readOnly
            value={narrativeApiData}
            className="min-h-[200px]"
          />
        </div>
        <div className="space-y-2">
          <Label>API Data Story Template</Label>
          <Textarea
            value={templateApi}
            disabled
            onChange={(e) => setTemplateApi(e.target.value)}
            className="min-h-[200px]"
            placeholder="Paste your template here..."
          />
        </div>
        {/* <Button onClick={generateNarrative} className="w-full">
          Generate Text
        </Button> */}
      </CardContent>
    </Card>
  );
};

export default NarrativeTemplate;
