"use client";
import { Switch } from "@/components/ui/switch";
import { form_json } from "../../../types/types";
import { useEffect, useState } from "react";

const RenderSwitch = ({
  currentField,
  setInput,
}: {
  currentField: form_json;
  setInput: (value: string) => void;
}) => {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (currentField.variant === "Switch") {
      setInput(checked.toString());
    }
  }, [checked, setInput, currentField.variant]);

  return (
    <div>
      <p>{currentField.label}</p>{" "}
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
};

export default RenderSwitch;
