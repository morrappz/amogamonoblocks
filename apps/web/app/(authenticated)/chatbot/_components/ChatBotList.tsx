import React from "react";
import { Message } from "./ChatBot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchFormSetupData } from "../lib/actions";
import { form_json_list } from "../../agentmaker/types/types";

const ChatBotList = ({
  messages,
  userName,
  setFormFields,
  setCurrentFieldIndex,
  onSend,
}: {
  messages: Message[];
  userName: string;
  setFormFields: React.Dispatch<React.SetStateAction<form_json_list>>;
  setCurrentFieldIndex: (value: number) => void;
  onSend: (value: string, role: "user" | "bot", buttons?: string[]) => void;
}) => {
  const handleClick = async (text: string) => {
    try {
      const response = await fetchFormSetupData(text);
      const formData = response.data[0]?.form_json;
      if (formData && formData?.length > 0) {
        setFormFields(formData);
        setCurrentFieldIndex(0);

        const firstQuestion = formData[0].label;
        onSend(firstQuestion, "bot");
      } else {
        onSend("No fields found in form", "bot");
      }
    } catch (error) {
      throw error;
    }
  };
  return (
    <div className="max-h-[80%] mt-5 h-full ">
      <ScrollArea className=" h-full overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className="flex items-center gap-2.5 p-2.5  mb-2.5 rounded-md"
          >
            {message.role === "user" ? (
              <Avatar>
                <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <Bot className="w-5 h-5" />
            )}
            <div className="bg-muted p-2.5 w-full rounded-md">
              <span>{message.text}</span>
              <div className="flex gap-2.5">
                {message.buttons &&
                  message.buttons?.length > 0 &&
                  message.buttons.map((item, index) => (
                    <div key={index} className="">
                      <Button
                        onClick={() => handleClick(item)}
                        className="rounded-full"
                        variant={"outline"}
                      >
                        {item}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ChatBotList;
