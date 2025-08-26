"use client";
import { Progress } from "@/components/ui/progress";
import { form_json } from "../../../types/types";
import React, { useEffect, useState } from "react";
import { useFormStore } from "../lib/formStore";
import { Label } from "@/components/ui/label";

const RenderProgress = ({ form_json }: { form_json: form_json }) => {
  const [value, setValue] = useState(50);
  const { updateFormData } = useFormStore();

  useEffect(() => {
    if (form_json.variant === "Slider") {
      setValue(value);
      updateFormData(form_json.name, value.toString());
    }
  }, [updateFormData, form_json, value]);
  return (
    <div>
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <Progress value={value} className="w-[60%]" />
    </div>
  );
};

export default RenderProgress;
