/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  generateChartConfig,
  generateQuery,
  runGenerateSQLQuery,
} from "./actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Session } from "./BoardMaker";
import SendMediaCardJSON from "@/app/(authenticated)/agentmaker/_components/field-types/chat-with-data-json/SendMediaCard";

const RenderInputField = ({
  currentField,
  formData,
  setFormData,
  setResults,
  setColumns,
  setChartConfig,
  setLoading,
  setComponentName,
  setApiData,
}: {
  currentField: any;
  formData: Record<string, any>;
  setFormData: (formData: Record<string, any>) => void;
  setResults: any;
  setChartConfig: any;
  setColumns: any;
  setLoading: any;
  setComponentName: any;
  setApiData: (data: any) => any;
}) => {
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const handleSubmit = async (suggestion: any, dataFilter: any) => {
    setLoading(true);
    const question = suggestion;
    if (!suggestion) return;
    try {
      const query = await generateQuery(question, session, dataFilter);
      if (query === undefined) {
        toast.error("An error occurred. Please try again.");
        return;
      }
      const data = await runGenerateSQLQuery(query);
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      setResults(data);
      setColumns(columns);
      const generation = await generateChartConfig(data, question);
      setChartConfig(generation.config);
      setLoading(false);
    } catch (e) {
      console.log("error----", e);
      setLoading(false);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      preference: value,
    }));
    const selectedItem = currentField.chat_with_data?.buttons?.find(
      (item: any) => item?.button_text === value
    );
    if (selectedItem) {
      setComponentName(selectedItem);
    }
    if (selectedItem?.enable_prompt) {
      handleSubmit(selectedItem?.prompt, selectedItem?.prompt_dataFilter);
    }
    if (selectedItem?.enable_api || selectedItem?.enable_dataApi) {
      setApiData(selectedItem);
    }
  };

  switch (currentField.variant) {
    case "Chat with Data JSON":
      return (
        <Card className="w-full overflow-hidden">
          <CardContent className="space-y-4 p-4">
            {(currentField?.media_card_data?.media_url ||
              currentField?.media_card_data?.custom_html) && (
              <div className="mb-4">
                <SendMediaCardJSON
                  field={currentField}
                  formData={formData}
                  onRadioChange={handleRadioChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export default RenderInputField;
