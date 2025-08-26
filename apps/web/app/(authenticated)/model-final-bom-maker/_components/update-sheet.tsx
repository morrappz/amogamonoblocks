"use client";

import { type FinalBom, FinalBomStatuses } from "../type";
import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  type UpdateFinalBomSchema,
  updateFinalBomSchema,
} from "../_lib/validations";
import {
  Dialog,
  DialogClose,
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

interface UpdateRecordSheetProps
  extends React.ComponentPropsWithRef<typeof Dialog> {
  record: FinalBom | null;
  isNew?: boolean;
}

type Template = {
  data_upload_id: number;
  model_name: string;
  data_combination_json: Record<string, string>;
  file_name: string;
};

const steps = [
  "Select Draft BOM Template",
  "Review Raw BOM Data",
  "Show Model Final BOM Data",
  "Finalize BOM",
];

/*const convertRequiredField = (value: unknown): boolean => {
  if (typeof value === "string") {
    return value.toLowerCase() === "yes";
  }
  return !!value;
};*/

export function UpdateRecordSheet({
  record,
  isNew = false,
  ...props
}: UpdateRecordSheetProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isUpdatePending] = React.useTransition();
  const [selectedTemplate, setSelectedTemplate] = React.useState<
    Template | undefined
  >();

  const [finalBomData, setFinalBomData] = React.useState<
    Record<string, string>[] | undefined
  >();
  const [rawBomCount, setRawBomCount] = React.useState(0);

  const [uploadCompleted, setUploadCompleted] = React.useState<boolean>(false);
  const form = useForm<UpdateFinalBomSchema>({
    resolver: zodResolver(updateFinalBomSchema),
  });

  React.useEffect(() => {
    const schemaKeys = Object.keys(updateFinalBomSchema.shape);

    const sanitizedRecord = Object.fromEntries(
      Object.entries(record || {})
        .filter(([key]) => schemaKeys.includes(key))
        .map(([key, value]) => [key, value ?? ""])
    );

    form.reset({
      ...sanitizedRecord,
      status: record?.status || FinalBomStatuses[0],
    });
  }, [record, form, isNew]);

  const nextStep = () => {
    if (currentStep === 1 && (!finalBomData || finalBomData.length === 0)) {
      toast.error("Raw BOM data is required.");
      return;
    }
    if (currentStep < steps.length - 1) {
      if (currentStep === 0 && !selectedTemplate) {
        toast.error("Select both Model and Raw BOM data.");
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && !uploadCompleted) {
      if (currentStep == 2) {
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);

    const schemaKeys = Object.keys(updateFinalBomSchema.shape);

    const sanitizedRecord = Object.fromEntries(
      Object.entries(record || {})
        .filter(([key]) => schemaKeys.includes(key))
        .map(([key, value]) => [key, value ?? ""])
    );

    form.reset({
      ...sanitizedRecord,
      status: record?.status || FinalBomStatuses[0],
    });

    setFinalBomData([]);
    setUploadCompleted(false);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1
            form={form}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        );
      case 1:
        return (
          <Step2
            selectedTemplate={selectedTemplate}
            setFinalBomData={setFinalBomData}
            rawBomCount={rawBomCount}
            setRawBomCount={setRawBomCount}
          />
        );
      case 2:
        return <Step3 finalBomData={finalBomData} />;
      case 3:
        return (
          <Step4
            form={form}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            setRawBomCount={setRawBomCount}
            setCurrentStep={setCurrentStep}
            finalBomData={finalBomData}
            setFinalBomData={setFinalBomData}
            onComplete={(success) => {
              if (success) {
                setUploadCompleted(true);
              }
            }}
          />
        );
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
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {isNew
              ? "Draft BOM to Model Final BOM Wizard"
              : "Update Raw BOM Upload"}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? "Enter details to make a Model Final BOM."
              : "Update the Raw BOM Upload details and save the changes."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4 w-full overflow-auto">
            <div className="mb-8">
              <ProgressIndicator steps={steps} currentStep={currentStep} />
            </div>
            <div className="">{renderStep()}</div>
            <DialogFooter className="gap-2 pt-2 sm:space-x-0 flex">
              {currentStep === steps.length - 1 ? (
                <div className="flex w-full justify-between">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    disabled={uploadCompleted}
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button
                        disabled={isUpdatePending}
                        type="button"
                        variant="outline"
                      >
                        Done
                      </Button>
                    </DialogClose>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}
