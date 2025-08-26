"use client";
import React from "react";
import { form_json } from "../../../types/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useFormStore } from "../lib/formStore";

const RadioOptions = ({ form_json }: { form_json: form_json }) => {
  const { updateFormData } = useFormStore();

  return (
    <div>
      <Label htmlFor="numeric-input">
        {form_json.label}
        {form_json.required && <span className="text-red-500">*</span>}
      </Label>

      <RadioGroup
        className="flex w-full flex-wrap items-center"
        onValueChange={(value) => updateFormData(form_json.name, value)}
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {form_json.radiogroup?.map((item, index) =>
            item ? (
              <div
                key={index}
                className={`flex border rounded-full p-2.5 items-center gap-2 transition-colors
                  ${
                    form_json.value === item
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-primary/10"
                  }`}
              >
                <RadioGroupItem
                  value={item}
                  id={index.toString()}
                  className="data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <Label htmlFor={index.toString()} className="cursor-pointer">
                  {item}
                </Label>
              </div>
            ) : null
          )}
        </div>
      </RadioGroup>
    </div>
  );
};

export default RadioOptions;
