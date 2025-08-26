import { Input } from "@/components/ui/input";
import React from "react";
import { form_json } from "../../../types/types";

const RenderLabel = ({
  currentField,

  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  React.useEffect(() => {
    if (currentField.variant === "Label") {
      setInput(currentField.label);
    }
  }, [currentField, setInput]);
  return (
    <Input
      type="text"
      placeholder={currentField.placeholder}
      readOnly
      value={currentField.placeholder}
      className=" border-gray-700 bg-gray-100 placeholder:text-gray-400"
    />
  );
};

export default RenderLabel;
