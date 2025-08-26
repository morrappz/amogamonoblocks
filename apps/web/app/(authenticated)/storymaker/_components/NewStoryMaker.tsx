"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProgressIndicator from "./steps/progress-indicator";
import Step1 from "./steps/step-1";
import Step2 from "./steps/step-2";
import Step3 from "./steps/step-3";
import Step4 from "./steps/step-4";
import { ExtractMetricGroupScope, StoryData, StoryGroup } from "../types/types";
import { toast } from "sonner";
import {
  createStoryMaker,
  // createTemplate,
  updateStoryMaker,
} from "../lib/actions";
import { Loader } from "lucide-react";

interface Query {
  id: number;
  name: string;
  type: "card" | "chart"; // Union type for specific values
  query: string;
  description: string;
  api?: string; // Optional field
  chartType?: string; // Optional field
  [key: string]: unknown; // For any additional dynamic fields
}

export interface StoryJsonItem {
  name: string;
  type: string;
  queries: Query[];
  description: string;
  [key: string]: unknown; // For any additional dynamic fields
}

const steps = [
  "Select Story Group",
  "View Extract",
  "Generate Templates",
  "Pug Template",
];

interface NewStoryMakerProps {
  isNew?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyTemplates: StoryGroup[];
  selectedStory: StoryData | null;
  rowAction: string;
}

export function NewStoryMaker({
  isNew = false,
  storyTemplates,
  selectedStory,
  rowAction,
  ...props
}: NewStoryMakerProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [storyTitle, setStoryTitle] = React.useState<string>("");
  const [storyDescription, setStoryDescription] = React.useState<string>("");
  const [metricsGroup, setMetricsGroup] =
    React.useState<ExtractMetricGroupScope | null>(null);
  const [selectedStoryGroup, setSelectedStoryGroup] =
    React.useState<StoryGroup>();
  const [status, setStatus] = React.useState<string>("Active");
  const [titleError, setTitleError] = React.useState<boolean>(false);
  const [templateError, setTemplateError] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [prompt, setPrompt] = React.useState("");
  const [storyResponse, setStoryResponse] = React.useState("");
  const [storyJson, setStoryJson] = React.useState<StoryJsonItem[] | null>();

  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");

  const [userDefinedColumns, setUserDefinedColumns] =
    React.useState<StoryGroup | null>(null);

  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [story, setStory] = React.useState<string[]>([]);
  const [userDefinedMetricScope, setUserDefinedMetricScope] =
    React.useState<ExtractMetricGroupScope | null>(null);

  const [template, setTemplate] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (selectedStoryGroup) {
      setUserDefinedMetricScope(
        selectedStoryGroup.data_model_json.extract_metric_group_scope
      );
    }
    if (selectedStory && rowAction === "edit") {
      setUserDefinedMetricScope(
        selectedStory?.userdefined_extract_metric_scope_json
      );
    }
    if (selectedStory && rowAction === "edit") {
      setUserDefinedColumns(
        selectedStory?.userdefined_table_column_json || null
      );
    }
  }, [selectedStoryGroup, selectedStory, rowAction]);

  React.useEffect(() => {
    if (selectedStory && rowAction === "edit") {
      setStoryTitle(selectedStory?.story_title);
      setStoryDescription(selectedStory?.story_description || "");
      setSelectedTemplate(selectedStory?.story_group);
      setStatus(selectedStory?.status || "Active");
      setSelectedStoryGroup(selectedStory?.table_column_json || null);
      setKeywords(selectedStory?.keyword_extract_metric_json || []);
      setStory(selectedStory?.story_extract_metric_json || []);
      setUserDefinedMetricScope(
        selectedStory?.userdefined_extract_metric_scope_json
      );
      setMetricsGroup(selectedStory?.userdefined_extract_metric_scope_json);
      //step-4 and 5
      setPrompt(selectedStory?.pug_template_prompt || "");
      setStoryResponse(selectedStory?.pug_template_prompt_response || "");
      setTemplate(selectedStory?.pug_template_json || "");
      setStoryJson(selectedStory?.story_json || null);
    }
  }, [selectedStory, rowAction]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!keywords.length || !story.length) {
      toast.error("Please generate templates first");
      return;
    }

    if (!template.length) {
      toast.error("Please add a template");
      return;
    }

    setIsLoading(true);
    let response;
    if (isNew) {
      response = await createStoryMaker({
        story_title: storyTitle,
        story_description: storyDescription,
        selected_template: selectedTemplate,
        metricsGroup: metricsGroup,
        keywords: keywords,
        story: story,
        status: status,
        userDefinedColumns: userDefinedColumns,
        selectedStoryGroup: selectedStoryGroup,
        userDefinedMetricScope: userDefinedMetricScope,
        //step-4 and 5
        pug_template_prompt: prompt,
        pug_template_promt_response: storyResponse,
        pug_template: template,
        story_json: storyJson,
      });
      // await createTemplate(storyTitle, template);
      setIsLoading(false);
    } else {
      response = await updateStoryMaker({
        story_id: selectedStory?.story_id,
        story_title: storyTitle,
        story_description: storyDescription,
        selected_template: selectedTemplate,
        metricsGroup: metricsGroup,
        keywords: keywords,
        story: story,
        status: status,
        userDefinedColumns: userDefinedColumns,
        selectedStoryGroup: selectedStoryGroup,
        pug_template_prompt: prompt,
        pug_template_prompt_response: storyResponse,
        pug_template: template,
        story_json: storyJson,
      });
      setIsLoading(false);
    }
    if (response.error) {
      setIsLoading(false);
      toast.error(response.error);
    } else {
      setIsLoading(false);
      toast.success(
        isNew ? "Story created successfully" : "Story updated successfully"
      );
      props.onOpenChange?.(false);
      reset();
    }

    return;
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 0) {
        const hasTitleError = !storyTitle.trim();
        const hasTemplateError = !selectedTemplate;

        setTitleError(hasTitleError);
        setTemplateError(hasTemplateError);

        if (hasTitleError || hasTemplateError) {
          toast.error("Please fill all required fields");
          return;
        }
      }
      if (currentStep === 1) {
        if (
          !selectedStoryGroup ||
          !userDefinedColumns?.data_model_json?.columns.some(
            (item) => item.extract_metrics
          )
        ) {
          toast.error("Please Select atleast 1 metric fields");
          return;
        }
      }
      if (currentStep === 2) {
        if (!keywords.length || !story.length) {
          toast.error("Please generate keywords first");
          return;
        }
      }
      if (currentStep === 3) {
        if (!storyResponse) {
          toast.error("Please fill all the fields");
          return;
        }
      }
      if (currentStep === 4) {
        if (!storyJson) {
          toast.error("Please generate a story first");
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setStoryTitle("");
    setStoryDescription("");
    setSelectedTemplate("");
    setMetricsGroup(null);
    setKeywords([]);
    setStory([]);
    setTitleError(false);
    setTemplateError(false);
    setTemplate([]);
    setPrompt("");
    setStoryResponse("");
    setStoryJson(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1
            story_title={storyTitle}
            setStoryTitle={setStoryTitle}
            story_description={storyDescription}
            setStoryDescription={setStoryDescription}
            selected_template={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            storyTemplates={storyTemplates}
            metricsGroup={metricsGroup}
            setMetricsGroup={setMetricsGroup}
            setSelectedStoryGroup={setSelectedStoryGroup}
            setStatus={setStatus}
            status={status}
            titleError={titleError}
            templateError={templateError}
            userDefinedMetricScope={userDefinedMetricScope}
            setUserDefinedMetricScope={setUserDefinedMetricScope}
            rowAction={rowAction}
          />
        );
      case 1:
        return (
          <Step2
            selectedStoryGroup={selectedStoryGroup as StoryGroup}
            userDefinedColumns={userDefinedColumns as StoryGroup}
            setUserDefinedColumns={setUserDefinedColumns}
            userDefinedMetricScope={
              userDefinedMetricScope as ExtractMetricGroupScope
            }
            rowAction={rowAction}
          />
        );
      case 2:
        return (
          <Step3
            userDefinedColumns={userDefinedColumns as StoryGroup}
            keywords={keywords}
            setKeywords={setKeywords}
            story={story}
            setStory={setStory}
          />
        );
      case 3:
        return (
          <Step4
            prompt={prompt}
            setPrompt={setPrompt}
            response={storyResponse}
            setResponse={setStoryResponse}
            template={template}
            setTemplate={setTemplate}
            keywords={keywords}
          />
        );
      // case 4:
      //   return <Step5 storyJson={storyJson} setStoryJson={setStoryJson} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      {...props}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          props.onOpenChange?.(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-5xl max-h-[80%] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "New Story Maker" : "Update Story Maker"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to create a new Story Maker."
              : "Update the Story Maker details and save the changes."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full overflow-auto"
        >
          <div className="mb-8">
            <ProgressIndicator steps={steps} currentStep={currentStep} />
          </div>
          <div className="">{renderStep()}</div>
          <DialogFooter className="gap-2 pt-2 sm:space-x-0 flex">
            {currentStep === steps.length - 1 ? (
              <div className="flex w-full justify-between">
                <Button type="button" onClick={prevStep} variant="outline">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader className="w-4 animate-spin h-4 mr-2" />
                    )}
                    {isLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : currentStep === 0 ? (
              <>
                <div></div> {/* Empty div to maintain spacing */}
                <Button type="button" onClick={nextStep} variant="outline">
                  Next
                </Button>
              </>
            ) : (
              <div className="flex w-full justify-between">
                <Button type="button" onClick={prevStep} variant="outline">
                  Previous
                </Button>
                <Button type="button" onClick={nextStep} variant="outline">
                  Next
                </Button>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
