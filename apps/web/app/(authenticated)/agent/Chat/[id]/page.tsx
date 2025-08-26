"use client";

import { SAVE_FORM_FIELDS } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import ChatEditor from "../../_components/Chat/ChatEditor";

const Page = ({ params }: { params: { id: string } }) => {
  const { id } = params;
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
      <ChatEditor field={chatData} />
    </div>
  );
};

export default Page;
