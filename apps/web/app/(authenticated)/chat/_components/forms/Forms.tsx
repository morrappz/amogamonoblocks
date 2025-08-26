"use client";
import React from "react";
import FormsHeader from "./FormsHeader";
import FormList from "./FormList";
import FormInput from "./FormInput";
import { v4 as uuidv4 } from "uuid";
import { FormSetup } from "../../types/types";
import { toast } from "sonner";

export interface Message {
  id: string;
  text: string;
  role: "user" | "bot";
  buttons?: string[];
}

const Forms = ({ formData }: { formData: FormSetup }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [formFilled, setFormFilled] = React.useState(false);
  const [data, setData] = React.useState<Record<string, string>>({});
  const form_name = formData?.form_name;
  const form_json = formData?.form_json;

  React.useEffect(() => {
    if (form_json?.length > 0 && currentIndex === 0 && !formFilled) {
      const currentField = form_json[0];
      const initialMsg: Message = {
        id: uuidv4(),
        text: currentField.label,
        role: "bot",
      };
      setMessages((prev) => [...prev, initialMsg]);
    }
  }, [form_json, currentIndex, formFilled]);

  const handleSubmit = (text: string, role: "user" | "bot") => {
    const newMsg = {
      id: uuidv4(),
      text,
      role,
    };
    setMessages((prev) => [...prev, newMsg]);

    if (role === "user" && currentIndex !== null && form_json?.length > 0) {
      const currentField = form_json[currentIndex];
      setData({
        ...data,
        [currentField.label]: text,
      });

      if (currentIndex < form_json.length - 1) {
        const nextField = form_json[currentIndex + 1];
        const botMsg: Message = {
          id: uuidv4(),
          text: nextField.label,
          role: "bot",
        };
        setMessages((prev) => [...prev, botMsg]);
        setCurrentIndex(currentIndex + 1);
        setData({
          ...data,
          [currentField.label]: text,
        });
      } else {
        const summaryMsg: Message = {
          id: uuidv4(),
          text: "Thank You for submitting form. Here's a summary of your inputs:",
          role: "bot",
        };
        toast.success("Form saved successfully");
        setFormFilled(true);
        setMessages((prev) => [...prev, summaryMsg]);
        setCurrentIndex(0);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      <FormsHeader formName={form_name} />
      <FormList messages={messages} data={data} formFilled={formFilled} />
      <div className="sticky bottom-0">
        <FormInput onSend={handleSubmit} formFilled={formFilled} />
      </div>
    </div>
  );
};

export default Forms;
