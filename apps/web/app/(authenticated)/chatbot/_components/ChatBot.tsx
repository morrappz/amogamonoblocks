"use client";
import React, { useState } from "react";
import ChatBotHeader from "./ChatBotHeader";
import ChatBotInput from "./ChatBotInput";
import ChatBotList from "./ChatBotList";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { form_json_list } from "../../agentmaker/types/types";

export interface Message {
  id: string;
  text: string;
  role: "user" | "bot";
  buttons?: string[];
}

const ChatBot = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [formFields, setFormFields] = React.useState<form_json_list>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = React.useState<
    number | null
  >(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { data: session } = useSession();

  React.useEffect(() => {
    const greeting: Message = {
      id: uuidv4(),
      text: `Hello ${session?.user?.user_name}! How can i Help you`,
      role: "bot",
    };
    setMessages([greeting]);
  }, [session]);

  const handleSubmit = (
    text: string,
    role: "user" | "bot",
    buttons?: string[]
  ) => {
    const newMsg: Message = {
      id: uuidv4(),
      text,
      role,
      buttons,
    };
    setMessages((prev) => [...prev, newMsg]);

    // Handle conversational form flow if it's the user's message
    if (
      role === "user" &&
      currentFieldIndex !== null &&
      formFields.length > 0
    ) {
      // get current field details
      const currentField = formFields[currentFieldIndex];

      // Save the user's answer for the current question
      setFormData((prev) => ({
        ...prev,
        [currentField.label]: text,
      }));

      const nextIndex = currentFieldIndex + 1;

      if (nextIndex < formFields.length) {
        // Move to the next question
        const nextField = formFields[nextIndex];
        setCurrentFieldIndex(nextIndex);

        const nextQuestionMsg: Message = {
          id: uuidv4(),
          text: nextField.label,
          role: "bot",
        };

        setMessages((prev) => [...prev, nextQuestionMsg]);
      } else {
        // All questions answered
        setCurrentFieldIndex(null); // Reset form progress
        setFormFields([]);
        setFormData({});

        // Add final answer to formAnswers
        const completedForm = {
          ...formData,
          [currentField.label]: text,
        };

        const summaryText = Object.entries(completedForm)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n");

        const summaryMsg: Message = {
          id: uuidv4(),
          text: `✅ Thank you! Here's what you submitted:\n\n${summaryText}`,
          role: "bot",
        };

        setMessages((prev) => [...prev, summaryMsg]);

        console.log("📤 Form Submission:", completedForm);
        // 👉 You can now save `completedForm` to Supabase or anywhere else
      }
    }
  };

  return (
    <div className="relative w-full  h-full">
      <ChatBotHeader />
      <ChatBotList
        messages={messages}
        userName={session?.user?.user_name ? session?.user?.user_name : ""}
        setFormFields={setFormFields}
        setCurrentFieldIndex={setCurrentFieldIndex}
        onSend={handleSubmit}
      />
      <div className=" sticky max-w-[800px] w-full bottom-0 mb-5">
        <ChatBotInput onSend={handleSubmit} formFields={formFields} />
      </div>
    </div>
  );
};

export default ChatBot;
