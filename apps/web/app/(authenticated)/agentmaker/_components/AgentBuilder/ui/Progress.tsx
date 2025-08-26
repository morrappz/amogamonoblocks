"use client";
import { Progress } from "@/components/ui/progress";
import { form_json } from "../../../types/types";
import React, { useEffect, useState } from "react";

const RenderProgress = ({
  currentField,
  setInput,
}: {
  currentField: form_json;
  setInput: (value: string) => void;
}) => {
  const [value, setValue] = useState(50);
  useEffect(() => {
    if (currentField.variant === "Slider") {
      setValue(value);
      setInput(value.toString());
    }
  }, [setInput, currentField, value]);
  return (
    <div>
      <p>{currentField.label}</p>
      <Progress value={value} className="w-[60%]" />
    </div>
  );
};

export default RenderProgress;
