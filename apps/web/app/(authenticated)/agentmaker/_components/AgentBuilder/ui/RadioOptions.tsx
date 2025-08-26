import React from "react";
import { form_json } from "../../../types/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const RadioOptions = ({
  setInput,
  currentField,
}: {
  setInput: (value: string) => void;
  currentField: form_json;
}) => {
  return (
    <div>
      <p>{currentField.label}</p>

      <RadioGroup
        value={currentField.value}
        onValueChange={setInput}
        className="flex w-full flex-wrap items-center"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {currentField.radiogroup?.map((item, index) =>
            item ? (
              <div
                key={index}
                className={`flex border rounded-full p-2.5 items-center gap-2 transition-colors
                  ${
                    currentField.value === item
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-primary/10"
                  }`}
              >
                <RadioGroupItem
                  value={item}
                  id={item}
                  className="data-[state=checked]:bg-white data-[state=checked]:text-primary"
                />
                <Label htmlFor={item} className="cursor-pointer">
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
