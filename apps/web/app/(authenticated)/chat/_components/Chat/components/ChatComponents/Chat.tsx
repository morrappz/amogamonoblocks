/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import {
  addLatestMessage,
  createMessage,
  fetchFormSetupData,
  getGroupData,
  getLatestMessages,
  getReceiverUserData,
  updateLatestMessage,
  uploadFile,
} from "@/app/(authenticated)/chat/lib/actions";
import { toast } from "sonner";
import { ChatGroup } from "@/app/(authenticated)/chat/types/types";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";

interface attachments {
  attachment_url: string | undefined;
  attachment_type: string | undefined;
  attachment_name: string | undefined;
}

const Chat = ({ chatId, isGroup }: { chatId?: string; isGroup: boolean }) => {
  const [groupData, setGroupData] = React.useState<ChatGroup | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [message, setMessage] = React.useState("");
  const [showCommands, setShowCommands] = React.useState(false);
  const [showUsers, setShowUsers] = React.useState(false);
  const [showForms, setShowForms] = React.useState(false);
  const [fileUploadLoading, setFileUploadLoading] = React.useState(false);
  const [attachments, setAttachments] = React.useState<attachments>({
    attachment_url: "",
    attachment_type: "",
    attachment_name: "",
  });
  const [repliedMessage, setRepliedMessage] = React.useState<any>(null);
  const [recipientDetails, setRecipientDetails] = React.useState<any>(null);
  const [latestMessage, setLatestMessage] = React.useState<any>(null);
  const [selectedFormId, setSelectedFormId] = React.useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();

  const generateRoomId = (
    sessionId: string | number,
    chatId: number | string
  ) => {
    return [sessionId, chatId].sort().join("_");
  };

  React.useEffect(() => {
    const fetchLatestMessage = async () => {
      const response = await getLatestMessages();
      setLatestMessage(response);
    };
    fetchLatestMessage();
  }, []);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      if (!chatId) return;

      try {
        const response = await getReceiverUserData(parseInt(chatId));

        if (response) {
          setRecipientDetails(response?.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch user details");
      }
    };

    fetchUserDetails();
  }, [chatId]);

  React.useEffect(() => {
    const fetchGroupData = async () => {
      if (isGroup) {
        try {
          const response = await getGroupData(chatId);
          if (response) {
            setGroupData(response[0]);
          }
        } catch (error) {
          console.log(error);
          toast.error("Failed to fetch group data");
        }
      }
    };
    fetchGroupData();
  }, [chatId, isGroup]);

  const filteredAgents = useMemo(() => {
    if (!groupData) return;
    if (groupData) {
      const userDetails = groupData?.chat_group_users_json;
      const filterAgentBots = userDetails.filter(
        (user) => user.user_group_list === "analytic-assistant"
      );

      return filterAgentBots;
    }
  }, [groupData]);

  const filteredGroupUsers = useMemo(() => {
    if (!groupData) return;
    if (groupData) {
      const userDetails = groupData?.chat_group_users_json;
      const filteredUsers = userDetails.filter(
        (user) => user.user_group_list !== "analytic-assistant"
      );
      return filteredUsers;
    }
  }, [groupData]);

  const filterFormGroups = useMemo(() => {
    if (!groupData) return;
    if (groupData) {
      const userDetails = groupData?.chat_group_users_json;
      const filteredForms = userDetails.filter(
        (user) => user.user_group_list === "chatforms"
      );
      return filteredForms;
    }
  }, [groupData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value === "/") {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
    const lastValue = value && value.split("").pop();
    if (lastValue?.startsWith("@")) {
      setShowUsers(true);
    }
    if (value === "/form") {
      setShowForms(true);
    } else {
      setShowForms(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUploadLoading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setFileUploadLoading(false);
      return;
    }
    setMessage(file.name || "");
    const formData = new FormData();
    formData.append("file", file);

    try {
      let fileType = "others";
      if (file) {
        if (file?.type.includes("image")) {
          fileType = "media";
        } else if (file?.type.includes("pdf")) {
          fileType = "pdf";
        } else if (file?.type.includes("csv")) {
          fileType = "csv";
        } else if (
          file?.type.includes("xlsx") ||
          file?.type.includes("spreadsheetml") ||
          file?.name.toLowerCase().endsWith(".xlsx") ||
          file?.name.toLowerCase().endsWith(".xls")
        ) {
          fileType = "xlsx";
        } else if (
          file?.type.includes("docx") ||
          file?.type.includes("document") ||
          file?.name.toLowerCase().endsWith(".docx") ||
          file?.name.toLowerCase().endsWith(".doc")
        ) {
          fileType = "docx";
        } else if (
          file?.type.includes("pptx") ||
          file?.type.includes("presentation") ||
          file?.name.toLowerCase().endsWith(".pptx") ||
          file?.name.toLowerCase().endsWith(".ppt")
        ) {
          fileType = "pptx";
        }
      }

      const folderPath = `${session?.user?.user_name}/chat/${fileType}`;
      // const response = await UploadAttachment({
      //   file: file,
      //   fileName: file?.name || "",
      //   folderName: folderPath,
      // });
      const response = await uploadFile(
        file,
        file?.name,
        folderPath,
        fileType,
        "chat_files"
      );
      setAttachments({
        attachment_url: response.url,
        attachment_type: file?.type,
        attachment_name: file?.name,
      });
    } catch (error) {
      toast.error(`Error Uploading File ${error}`);
    } finally {
      setFileUploadLoading(false);
    }
  };

  const handleUserSelect = (user: string) => {
    setMessage((prev) => prev + `${user} `);
    setShowUsers(false);
  };

  const handleFormSelect = (form: string, userId: number) => {
    if (message) {
      setMessage("");
    }
    setMessage((prev) => prev + `${form}`);
    setSelectedFormId(userId);
    setShowForms(false);
  };

  const handleCommands = async (item: any) => {
    if (!chatId || !session?.user?.user_catalog_id) return;
    try {
      const roomId = isGroup
        ? chatId
        : generateRoomId(session?.user?.user_catalog_id, chatId);
      const unqChatId = uuidv4();

      const response: any = await fetchFormSetupData(item.agent_uuid);
      if (!response.success) {
        toast.error("Failed to fetch data");
        return;
      }
      const result = response.data[0]?.content;
      // const storyApiUrl = response.data[0]?.story_api;
      // if (!storyApiUrl) {
      //   toast.error("No Story API Found");
      //   return;
      // }
      // const fetchStoryJson = await fetch(storyApiUrl);
      // const result = await fetchStoryJson.json();
      // console.log("result-----", result);

      // setDbConnectionStr(response.data[0]?.db_connection_json);
      setShowCommands(false);
      const botMessage = {
        id: unqChatId,
        created_date: new Date().toISOString(),
        created_user_name: item.user_name,
        chat_message: `Starting conversation with ${item.user_name}...`,
        sender_id: item.user_catalog_id,
        chat_message_type: "agent_message",
        soc_room_id: roomId,
        content_json: result,
        db_connection_json: response.data[0]?.db_connection_json,
        api_connection_json: response.data[0]?.api_connection_json,
      };
      // setMessages((prev) => [...prev, botMessage]);
      await createMessage(botMessage);
      setMessage("");
    } catch (error) {
      console.log("error-----", error);
      toast.error(`${error}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chatId || !session?.user?.user_catalog_id) return;

    const roomId = isGroup
      ? chatId
      : generateRoomId(session?.user?.user_catalog_id, chatId);

    const unqChatId = uuidv4();

    const payload = {
      id: unqChatId,
      created_user_id: session?.user?.user_catalog_id,
      created_user_name: session?.user?.user_name,
      created_date: new Date().toISOString(),
      replied_to_message_id:
        repliedMessage?.messageUniqueId ||
        repliedMessage?.id ||
        repliedMessage?.agentMsgId,
      chat_message_type: "text",
      soc_room_id: roomId,
      attachment_url: attachments?.attachment_url,
      attachment_type: attachments?.attachment_type,
      attachment_name: attachments?.attachment_name,
      sender_id: session?.user?.user_catalog_id,
      receiver_user_id: isGroup ? null : recipientDetails[0]?.user_catalog_id,
      receiver_group_id: isGroup ? chatId : null,
      chat_message: message,
      from_business_number: session?.user?.business_number,
      from_business_name: session?.user?.business_name,
      to_business_number: recipientDetails[0]?.business_number,
      to_business_name: recipientDetails[0]?.business_name,
      for_business_number: recipientDetails[0]?.business_number,
      for_business_name: recipientDetails[0]?.business_name,
      selected_form_id: selectedFormId,
    };

    try {
      // await axiosInstance.post(CHAT_MESSAGE_API, payload);

      await createMessage(payload);

      // Check if there's an existing latest message for this specific conversation
      const existingLatestMessage =
        latestMessage && latestMessage.length > 0
          ? latestMessage.find((msg: any) =>
              isGroup
                ? // For group messages, match by group ID
                  msg.receiver_group_name == chatId
                : // For direct messages, match by sender/receiver pair
                  (msg.sender_id == session?.user?.user_catalog_id &&
                    msg.receiver_id == recipientDetails[0]?.user_catalog_id) ||
                  (msg.sender_id == recipientDetails[0]?.user_catalog_id &&
                    msg.receiver_id == session?.user?.user_catalog_id)
            )
          : null;

      const latestMessagePayload = {
        sender_id: session?.user?.user_catalog_id,
        receiver_id: recipientDetails[0]?.user_catalog_id,
        sender_user_name: session?.user?.user_name,
        receiver_user_name: recipientDetails[0]?.first_name,
        receiver_group_name: isGroup ? chatId : null,
        chat_message: message,
        created_datetime: new Date().toISOString(),
        created_user_id: session?.user?.user_catalog_id,
      };

      if (existingLatestMessage) {
        await updateLatestMessage(
          latestMessagePayload,
          existingLatestMessage.id
        );
      } else {
        await addLatestMessage(latestMessagePayload);
      }

      setMessage("");
      setAttachments({
        attachment_url: "",
        attachment_type: "",
        attachment_name: "",
      });
      setRepliedMessage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="relative w-full  h-full">
      <ChatHeader isGroup={isGroup} groupData={groupData} />
      <ChatMessage
        messages={[...messages].sort(
          (a, b) =>
            new Date(a.created_date).getTime() -
            new Date(b.created_date).getTime()
        )}
        setMessages={setMessages}
        isGroup={isGroup}
        chatId={chatId}
        inputRef={inputRef}
        setRepliedMessage={setRepliedMessage}
      />
      <div className=" sticky max-w-[800px] w-full bottom-0 mb-5">
        <ChatInput
          inputRef={inputRef}
          onChange={handleChange}
          isGroup={isGroup}
          message={message}
          fileUpload={handleFileChange}
          fileUploadLoading={fileUploadLoading}
          repliedMessage={repliedMessage}
          setRepliedMessage={setRepliedMessage}
          onSubmit={handleSubmit}
          showCommands={showCommands}
          filteredAgents={filteredAgents}
          showUsers={showUsers}
          filteredGroupUsers={filteredGroupUsers}
          handleCommands={handleCommands}
          fileInputRef={fileInputRef}
          handleUserSelect={handleUserSelect}
          showForms={showForms}
          filteredForms={filterFormGroups}
          handleFormSelect={handleFormSelect}
        />
      </div>
    </div>
  );
};

export default Chat;
