import React from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormStore } from "../lib/formStore";

const RenderTextarea = ({ form_json }: { form_json: form_json }) => {
  const { formData, updateFormData } = useFormStore();

  return (
    <div className="space-y-2">
      <Label>{form_json.label}</Label>
      <span className="text-red-500">{form_json.required && "*"}</span>
      <p className="text-sm text-muted-foreground">{form_json.description}</p>
      <Textarea
        placeholder={form_json.placeholder}
        required={form_json.required}
        value={formData[form_json.name] || ""}
        onChange={(e) => updateFormData(form_json.name, e.target.value)}
      />
    </div>
  );
};

export default RenderTextarea;
