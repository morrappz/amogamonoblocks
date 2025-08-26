"use client";
import { Input } from "@/components/ui/input";
import React from "react";
import { form_json } from "../../../types/types";
import { Label } from "@/components/ui/label";

const RenderStartandEndTime = ({
  currentField,
  input,
  setInput,
}: {
  currentField: form_json;
  input: string;
  setInput: (value: string) => void;
}) => {
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");

  console.log(input);

  React.useEffect(() => {
    if (startTime && endTime) {
      setInput(`Start Time: ${startTime}, End Time: ${endTime}`);
    }
  }, [startTime, endTime, setInput]);
  return (
    <div className="flex w-full gap-2.5 items-center">
      <div className="w-full">
        <Label htmlFor="start-time">Start Time</Label>
        <Input
          type="number"
          id="start-time"
          placeholder={currentField.placeholder}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className=" border-gray-700 w-full placeholder:text-gray-400"
        />
      </div>
      <div className="w-full">
        <Label htmlFor="end-time">End Time</Label>
        <Input
          id="end-time"
          type="number"
          placeholder={currentField.placeholder}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className=" border-gray-700 w-full placeholder:text-gray-400"
        />
      </div>
    </div>
  );
};

export default RenderStartandEndTime;
