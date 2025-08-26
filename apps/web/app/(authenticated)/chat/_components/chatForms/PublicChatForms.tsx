"use client";
import React from "react";
import { form_json_list } from "../../types/types";
import { Progress } from "@/components/ui/progress";
import RenderChatForms from "./RenderChatForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useFormStore } from "./lib/formStore";
import { createFormData } from "./lib/actions";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const PublicChatForms = ({
  formJson,
  formId,
  formName,
  formUuid,
  apiUrl,
  apiKey,
}: {
  formJson: form_json_list;
  formId: number;
  formName: string;
  formUuid: string;
  apiUrl?: string;
  apiKey?: string;
}) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const totalSteps = formJson && formJson?.length;
  const { formData, resetForm } = useFormStore();
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const { data: session } = useSession();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await createFormData(
        formData,
        formId,
        formName,
        formUuid
      );
      const saveToTargetAPI = await fetch(apiUrl!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apiKey: apiKey!,
          Authorization: `Bearer ${apiKey!}`,
        },
        body: JSON.stringify({
          ...formData,
          created_user_id: session?.user?.user_catalog_id,
          created_user_name: session?.user?.user_name,
          created_date: new Date(),
          for_business_name: session?.user?.business_name,
          for_business_number: session?.user?.business_number,
          business_name: session?.user?.business_name,
          business_number: session?.user?.business_number,
        }),
      });
      if (!saveToTargetAPI.ok) {
        toast.error(
          "Error saving data to target table. Please verify the fields"
        );
      } else {
        toast.success("Data saved successfully to target table");
      }
      if (response.success) {
        toast.success("Data saved successfully");
        resetForm();
        setCurrentStep(0);
      } else {
        toast.error("Error saving data");
      }
    } catch (error) {
      toast.error(`Error saving data ${error}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    const currentField = formJson[currentStep];
    const currentValue = formData[currentField.name];

    if (currentField.required) {
      return (
        currentValue !== undefined &&
        currentValue !== "" &&
        currentValue !== null
      );
    }
    return true;
  };

  return (
    <div className="flex w-full  h-full flex-col justify-center items-center">
      <div className="w-full">
        <div className="flex justify-between">
          <span>
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />
      </div>
      <Card className="w-full p-8 mt-5">
        <div className="my-5 w-full">
          <RenderChatForms form_json={formJson[currentStep]} />
        </div>
        <div className="flex items-center mt-5 w-full justify-between">
          <Button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(currentStep - 1)}
            variant={"outline"}
            className="flex items-center"
          >
            <ArrowLeft className="w-5 h-5" /> Previous
          </Button>
          <div>
            {currentStep === totalSteps - 1 ? (
              <Button
                disabled={loading}
                onClick={handleSubmit}
                className="flex items-center"
              >
                <Send className="w-5 h-5" />{" "}
                {loading ? "Submitting..." : "Submit"}
              </Button>
            ) : (
              <Button
                className="flex items-center"
                disabled={!canProceed()}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                <ArrowRight className="w-5 h-5" /> Next
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PublicChatForms;
