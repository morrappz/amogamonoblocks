"use client";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DocumentViewer } from "react-documents";

interface FilePreviewProps {
  id: number;
  msgId: string;
  data: {
    attachment_url: string;
    attachment_type: string;
    attachment_name: string;
  }[];
}

const ChatFilePreview = ({ data, id }: FilePreviewProps) => {
  if (!data || !data.length || !data[0]?.attachment_url) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
        <p className="text-gray-500">No file available for preview</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px]  rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-200 pb-5 items-center justify-between">
        <Link href="/chat">
          <h1 className="flex text-xl font-semibold items-center gap-2">
            <Bot className="w-5 h-5 text-muted-foreground" />
            Chat
          </h1>
        </Link>
        <Link href={`/chat/contacts/messages/${id}`}>
          <Button variant="outline" className="border-0">
            Back to Chat
          </Button>
        </Link>
      </div>
      {data[0]?.attachment_type.includes("image") ? (
        <Image
          alt={data[0]?.attachment_name}
          src={data[0]?.attachment_url}
          height={500}
          width={500}
          className="w-full h-full object-cover"
        />
      ) : (
        <DocumentViewer queryParams="hl=Nl" url={data[0]?.attachment_url} />
      )}
    </div>
  );
};

export default ChatFilePreview;
