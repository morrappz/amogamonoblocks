"use client";
import { Switch } from "@/components/ui/switch";
import { form_json } from "../../../types/types";
import { useEffect, useState } from "react";
import { useFormStore } from "../lib/formStore";
import { Label } from "@/components/ui/label";

const RenderSwitch = ({ form_json }: { form_json: form_json }) => {
  const [checked, setChecked] = useState(false);
  const { updateFormData } = useFormStore();

  useEffect(() => {
    if (form_json.variant === "Switch") {
      updateFormData(form_json.name, checked.toString());
    }
  }, [checked, updateFormData, form_json]);

  return (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
};

export default RenderSwitch;
