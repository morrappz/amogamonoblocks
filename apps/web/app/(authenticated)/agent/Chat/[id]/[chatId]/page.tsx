"use client";
import ChatEditor from "@/app/(authenticated)/agent/_components/Chat/ChatEditor";
import { SAVE_FORM_FIELDS } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";

const Page = ({ params }: { params: { id: string; chatId: string } }) => {
  const { id, chatId } = params;
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    const fetchChatData = async () => {
      const response = await axiosInstance.get(
        `${SAVE_FORM_FIELDS}?form_id=eq.${id}`
      );
      setChatData(response.data[0]);
    };
    fetchChatData();
  }, [id]);
  return (
    <div className="min-h-[calc(90vh-200px)] overflow-hidden h-full max-w-[800px] mx-auto p-4 w-full">
      <ChatEditor field={chatData} chatId={chatId} />
    </div>
  );
};

export default Page;
