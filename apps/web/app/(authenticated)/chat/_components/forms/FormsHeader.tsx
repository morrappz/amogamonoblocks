import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const FormsHeader = ({ formName }: { formName: string }) => {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Bot className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{formName}</h1>
      </div>

      <Button variant={"outline"} onClick={router.back}>
        Back to Chat
      </Button>
    </div>
  );
};

export default FormsHeader;
