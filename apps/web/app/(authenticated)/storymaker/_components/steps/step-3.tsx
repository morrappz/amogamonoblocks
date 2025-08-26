"use client";
import { Button } from "@/components/ui/button";
import { StoryGroup } from "../../types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Code, Loader } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface ColumnConfig {
  column_name: string;
  column_type: string;
  required: boolean;
  extract_metrics: boolean;
  target_column_name: string;
}

interface TableConfig {
  source_table_name: string;
  target_table_name: string;
  extract_metric_group_scope: {
    Date: "yes" | "no";
    Text: "yes" | "no";
    Numeric: "yes" | "no";
  };
  columns: ColumnConfig[];
}

interface textMetrics {
  metricList: string[];
}

const Step3 = ({
  userDefinedColumns,
  keywords,
  setKeywords,
  story,
  setStory,
}: {
  userDefinedColumns: StoryGroup;
  keywords: string[];
  setKeywords: (value: string[]) => void;
  story: string[];
  setStory: (value: string[]) => void;
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  // const extractLinesFromHTMLArray = (htmlStrings: string[]): string => {
  //   const parser = new DOMParser();
  //   const allLines: string[] = [];

  //   htmlStrings.forEach((html) => {
  //     const doc = parser.parseFromString(html, "text/html");
  //     const lines = Array.from(doc.querySelectorAll("li")).map(
  //       (li) => li.textContent?.trim() || ""
  //     );
  //     allLines.push(...lines);
  //   });

  //   return allLines.join("\n");
  // };

  const handleGenerateTemplates = async (data_model_json: TableConfig) => {
    const { extract_metric_group_scope, columns } = data_model_json;
    const { Date, Text, Numeric } = extract_metric_group_scope;
    setIsLoading(true);
    if (keywords.length > 0 && story.length > 0) {
      setKeywords([]);
      setStory([]);
    }

    let newKeywords: string[] = [];
    let newStories: string[] = [];

    if (Date === "yes") {
      try {
        const extractDateMetrics = await fetch(
          "/api/story-maker/date-metrics",
          {
            method: "POST",
            body: JSON.stringify(columns),
          }
        );
        if (!extractDateMetrics.ok) {
          throw new Error("Failed to fetch date metrics");
        }
        const dateMetrics = await extractDateMetrics.json();

        newKeywords = [...newKeywords, ...dateMetrics?.metricList];
        // setKeywords((prev: string[]) => [...prev, ...dateMetrics?.metricList]);
        const response = await fetch("/api/story-maker/date-template", {
          method: "POST",
          body: JSON.stringify(dateMetrics),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch date template");
        }
        const data = await response.json();
        setIsLoading(false);
        // setStory(data?.html);
        newStories = [...newStories, data?.html];
      } catch (error) {
        console.log("error---------", error);
        setIsLoading(false);
        toast.error("Error generating story templates");
        return;
      }
    }
    if (Text === "yes") {
      try {
        const extractTextMetrics = await fetch(
          "/api/story-maker/text-metrics",
          {
            method: "POST",
            body: JSON.stringify(columns),
          }
        );
        const textMetrics: textMetrics = await extractTextMetrics.json();

        // setKeywords((prev: string[]) => [...prev, ...textMetrics?.metricList]);
        newKeywords = [...newKeywords, ...textMetrics?.metricList];

        const response = await fetch("/api/story-maker/text-template", {
          method: "POST",
          body: JSON.stringify(textMetrics),
        });
        const data = await response.json();
        setIsLoading(false);
        // setStory((prev: string[]) => [...prev, data?.html]);
        newStories = [...newStories, data?.html];
      } catch (error) {
        console.log("error---------", error);
        setIsLoading(false);
        toast.error("Error generating story templates");
        return;
      }
    }
    if (Numeric === "yes") {
      try {
        const extractNumericMetrics = await fetch(
          "/api/story-maker/numeric-metrics",
          {
            method: "POST",
            body: JSON.stringify(columns),
          }
        );
        const numericMetrics = await extractNumericMetrics.json();
        newKeywords = [...newKeywords, ...numericMetrics?.metricList];
        // setKeywords((prev: string[]) => [
        //   ...prev,
        //   ...numericMetrics?.metricList,
        // ]);

        const response = await fetch("/api/story-maker/numeric-template", {
          method: "POST",
          body: JSON.stringify(numericMetrics),
        });
        const data = await response.json();
        setIsLoading(false);
        // setStory((prev: string[]) => [...prev, data?.html]);
        newStories = [...newStories, data?.html];
      } catch (error) {
        console.log("error---------", error);
        setIsLoading(false);
        toast.error("Error generating story templates");
      }
    }
    setKeywords(Array.from(new Set(newKeywords)));
    setStory(newStories);
    setIsLoading(false);
  };

  // const stories = useMemo(() => extractLinesFromHTMLArray(story), [story]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Story Templates</h1>
        <Button
          onClick={() =>
            handleGenerateTemplates(userDefinedColumns?.data_model_json)
          }
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Code className="w-4 h-4 md:mr-2" />
          )}
          <span className="hidden md:block">
            {isLoading ? "Generating..." : "Generate Keywords"}
          </span>
          <span className=" md:hidden">
            {isLoading ? "Generating..." : "Generate"}
          </span>
        </Button>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="view-keywords">
          <TabsList
            className="w-full grid grid-cols-1"
            defaultValue={"view-keywords"}
          >
            <TabsTrigger value="view-keywords">View Keywords</TabsTrigger>
            {/* <TabsTrigger value="view-syntax">View Syntax</TabsTrigger> */}
          </TabsList>
          <TabsContent value="view-keywords">
            <div className="m-2.5">
              <Textarea
                value={keywords.join("\n")}
                className="min-h-[300px]"
                placeholder="Keywords"
              />
            </div>
          </TabsContent>
          {/* <TabsContent value="view-syntax">
            <div className="m-2.5">
              <Textarea
                value={story}
                className="min-h-[300px]"
                placeholder="Syntax"
              />
            </div>
          </TabsContent> */}
          <TabsContent value="view-template">
            <div className="m-2.5">
              <Textarea className="min-h-[300px]" placeholder="Syntax" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Step3;
