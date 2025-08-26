import { Input } from "@/components/ui/input";
import React from "react";
import { form_json } from "../../../types/types";

const RenderNumericTextbox = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  return (
    <Input
      type="number"
      placeholder={currentField.placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className=" border-gray-700 w-full placeholder:text-gray-400"
    />
  );
};

export default RenderNumericTextbox;
