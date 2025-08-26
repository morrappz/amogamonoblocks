"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import React from "react";

const FormInput = ({
  onSend,
  formFilled,
}: {
  onSend: (text: string, role: "user" | "bot") => void;
  formFilled: boolean;
}) => {
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(input, "user");
    setInput("");
  };

  return (
    <div className="mt-2.5">
      <form onSubmit={handleSubmit}>
        <div className="border p-2.5 flex rounded-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border-none"
            placeholder="Enter input..."
          />
          <Button
            disabled={formFilled}
            className="rounded-full p-2.5"
            size={"icon"}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormInput;
