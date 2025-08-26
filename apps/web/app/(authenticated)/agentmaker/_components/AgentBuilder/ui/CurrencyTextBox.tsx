import { Input } from "@/components/ui/input";
import React from "react";
import { form_json } from "../../../types/types";
import { DollarSign } from "lucide-react";

const RenderCurrencyTextbox = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  return (
    <div className="flex rounded-md items-center gap-2.5 border">
      <DollarSign className="w-5 h-5 text-muted-foreground ml-2" />
      <Input
        type="number"
        placeholder={currentField.placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className=" border-none w-full placeholder:text-gray-400"
      />
    </div>
  );
};

export default RenderCurrencyTextbox;
