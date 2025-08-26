import React from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { useFormStore } from "../lib/formStore";
import { Input } from "@/components/ui/input";

const RenderTextbox = ({ form_json }: { form_json: form_json }) => {
  const { formData, updateFormData } = useFormStore();

  return (
    <div className="space-y-2">
      <Label>{form_json.label}</Label>
      <span className="text-red-500">{form_json.required && "*"}</span>
      <p className="text-sm text-muted-foreground">{form_json.description}</p>
      <Input
        placeholder={form_json.placeholder}
        required={form_json.required}
        value={formData[form_json.name] || ""}
        onChange={(e) => updateFormData(form_json.name, e.target.value)}
      />
    </div>
  );
};

export default RenderTextbox;
