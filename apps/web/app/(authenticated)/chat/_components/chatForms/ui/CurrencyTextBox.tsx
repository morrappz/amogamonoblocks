import { Input } from "@/components/ui/input";
import React from "react";
import { form_json } from "../../../types/types";
import { DollarSign } from "lucide-react";
import { useFormStore } from "../lib/formStore";
import { Label } from "@/components/ui/label";

const RenderCurrencyTextbox = ({ form_json }: { form_json: form_json }) => {
  const { formData, updateFormData } = useFormStore();

  return (
    <div>
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex rounded-md items-center gap-2.5 border">
        <DollarSign className="w-5 h-5 text-muted-foreground ml-2" />
        <Input
          type="number"
          placeholder={form_json.placeholder}
          value={formData[form_json.name || ""]}
          onChange={(e) => updateFormData(form_json.name, e.target.value)}
          className=" border-none w-full placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export default RenderCurrencyTextbox;
