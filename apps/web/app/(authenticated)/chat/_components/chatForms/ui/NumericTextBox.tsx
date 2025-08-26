import { Input } from "@/components/ui/input";
import React from "react";
import { form_json } from "../../../types/types";
import { useFormStore } from "../lib/formStore";
import { Label } from "@/components/ui/label";

const RenderNumericTextbox = ({ form_json }: { form_json: form_json }) => {
  const { formData, updateFormData } = useFormStore();

  return (
    <div>
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        type="number"
        id="numeric-input"
        placeholder={form_json.placeholder}
        value={formData[form_json.name] || ""}
        onChange={(e) => updateFormData(form_json.name, e.target.value)}
        className=" border-gray-700 w-full placeholder:text-gray-400"
      />
    </div>
  );
};

export default RenderNumericTextbox;
