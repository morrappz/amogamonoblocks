import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import { ExtractMetricGroupScope, StoryGroup } from "../../types/types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const Step1 = ({
  story_title,
  story_description,
  selected_template,
  setStoryTitle,
  setStoryDescription,
  setSelectedTemplate,
  storyTemplates,
  metricsGroup,
  setMetricsGroup,
  setSelectedStoryGroup,
  setStatus,
  status,
  titleError,
  templateError,
  setUserDefinedMetricScope,
  userDefinedMetricScope,
}: {
  story_title: string;
  story_description: string;
  selected_template: string;
  setStoryTitle: (value: string) => void;
  setStoryDescription: (value: string) => void;
  setSelectedTemplate: (value: string) => void;
  storyTemplates: StoryGroup[];
  metricsGroup: ExtractMetricGroupScope | null;
  setMetricsGroup: (value: ExtractMetricGroupScope | null) => void;
  setStatus: (value: string) => void;
  setSelectedStoryGroup: (value: StoryGroup) => void;
  status: string;
  titleError: boolean;
  templateError: boolean;
  setUserDefinedMetricScope: (value: ExtractMetricGroupScope | null) => void;
  userDefinedMetricScope: ExtractMetricGroupScope | null;
  rowAction: string;
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5 p-2.5">
        <div className="space-y-2">
          <div className="flex justify-between w-full items-center">
            <div>
              <Label
                htmlFor="story-title"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  titleError ? "text-red-500" : ""
                }`}
              >
                Story Title
              </Label>
              <span className="text-red-500">*</span>
            </div>
            {titleError && <span className="text-red-500">required</span>}
          </div>
          <Input
            id="story-title"
            value={story_title}
            onChange={(e) => setStoryTitle(e.target.value)}
            className="w-full"
            aria-label="Story title input"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="story-description"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Story Description
          </Label>
          <Textarea
            id="story-description"
            value={story_description}
            onChange={(e) => setStoryDescription(e.target.value)}
            className="w-full"
            aria-label="Story description input"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between w-full items-center">
            <div>
              <Label
                htmlFor="story-template"
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  templateError ? "text-red-500" : ""
                }`}
              >
                Select Story Template
              </Label>
              <span className="text-red-500">*</span>
            </div>
            {templateError && <span className="text-red-500">required</span>}
          </div>
          <Select
            defaultValue={selected_template}
            onValueChange={(value) => {
              setSelectedTemplate(value);
              setSelectedStoryGroup(
                storyTemplates.find(
                  (template) => template.data_group_name === value
                ) as StoryGroup
              );
              setMetricsGroup(
                storyTemplates.find(
                  (template) => template.data_group_name === value
                )?.data_model_json?.extract_metric_group_scope || null
              );
            }}
          >
            <SelectTrigger id="story-template" className="w-full border">
              <SelectValue placeholder="Select Story Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {storyTemplates.map((template) => (
                  <SelectItem
                    key={template.data_group_id}
                    value={template.data_group_name}
                  >
                    {template.data_group_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {metricsGroup && (
          <div className="space-y-2">
            <Label
              htmlFor="metrics-group"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select Metrics Group
            </Label>
            {Object.keys(metricsGroup).map((key) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  checked={
                    userDefinedMetricScope?.[
                      key as keyof ExtractMetricGroupScope
                    ] === "yes"
                  }
                  onCheckedChange={(checked) => {
                    // Update userDefinedMetricScope
                    const updatedUserDefinedScope = {
                      ...userDefinedMetricScope,
                      [key]: checked ? "yes" : "no",
                    } as ExtractMetricGroupScope;
                    setUserDefinedMetricScope(updatedUserDefinedScope);
                  }}
                />
                <span>{key}</span>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Label
            htmlFor="status"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Select Status
          </Label>
          <Select
            defaultValue={status}
            onValueChange={(value) => setStatus(value)}
          >
            <SelectTrigger id="status" className="w-full capitalize">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Step1;
