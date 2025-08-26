"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import React from "react";
import { fetchFormSetupData } from "../lib/actions";
import { toast } from "sonner";
import { form_json_list } from "../../agentmaker/types/types";

const ChatBotInput = ({
  onSend,
  formFields
}: {
  onSend: (value: string, role: "user" | "bot",buttons?:string[]) => void;
  formFields: form_json_list
}) => {
  const [input, setInput] = React.useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSend(input,"user");
    if(formFields.length === 0){
    try {
      const response = await fetchFormSetupData(input);
      console.log("response----",response.data?.length > 0)
      if (response.success && response.data?.length > 0) {
        const result = response.data.map((agent) => agent.form_name);
       
        onSend("Here are matching forms: ",'bot',result)
      }
      else{
        onSend("No forms avaliable","bot")
      }
      if(!response.success){
        toast.error("No forms avaliable")
        onSend("No forms avaliable","bot")
      }
      console.log("response-----", response);
      setInput("");

    } catch (error) {
      toast.error("Error sending data");
      throw error;
    }
  }
  setInput("")
  };
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="border flex items-center w-full rounded-full p-2.5">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border-0"
            placeholder="Enter text..."
          />
          <Button size="icon" className="rounded-full p-2.5">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatBotInput;
