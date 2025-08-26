import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { form_json } from "../../../types/types";

const RenderTextarea = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  return (
    <Textarea
      placeholder={currentField.placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className=" border-gray-700 w-full placeholder:text-gray-400"
    />
  );
};

export default RenderTextarea;
