"use client";
import React, { useEffect } from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useFormStore } from "../lib/formStore";

const RenderLabel = ({ form_json }: { form_json: form_json }) => {
  const { updateFormData } = useFormStore();

  useEffect(() => {
    updateFormData(form_json.name, form_json.label);
  }, [form_json, updateFormData]);
  return (
    <div className="space-y-2">
      <Card className="p-2.5">
        <Label>{form_json.label}</Label>
        <span className="text-red-500">{form_json.required && "*"}</span>
        <p className="text-sm text-muted-foreground">{form_json.description}</p>
      </Card>
    </div>
  );
};

export default RenderLabel;
