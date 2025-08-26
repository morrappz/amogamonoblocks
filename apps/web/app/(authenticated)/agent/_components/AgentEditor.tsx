/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  ArrowUp,
  Bookmark,
  Bot,
  Check,
  Copy,
  Edit,
  Eye,
  FileUp,
  History,
  Loader2,
  Menu,
  Mic,
  Plus,
  RefreshCw,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HistoryBar from "./SideBar/History";
import MenuBar from "./SideBar/Menu";
import BookmarkBar from "./SideBar/Bookmark";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SAVE_FORM_FIELDS } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";

const AgentEditor = ({ chatId, mode }: { chatId?: string; mode?: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [openHistory, setOpenHistory] = useState<boolean>(false);
  const [openFavorites, setOpenFavorites] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);

  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  const [deleteHistory, setDeleteHistory] = useState<boolean>(false);
  const router = useRouter();
  const [userChatSession, setUserChatSession] = useState<any>({});
  const [chatData, setChatData] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [refreshBookmarkState, setRefreshBookmarkState] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [getMenuData, setMenuData] = useState<any>(null);
  const [boardContextData, setBoardContextData] = useState([]);

  useEffect(() => {
    const fetchMenuData = async () => {
      const response = await axiosInstance.get(SAVE_FORM_FIELDS);
      const filteredData = response.data.filter((form: any) =>
        form?.users_json?.includes(session?.user?.user_email)
      );
      setMenuData(filteredData);
    };
    fetchMenuData();
  }, [openMenu, session]);

  useEffect(() => {
    if (mode === "chat_with_board") {
      const fetchBoardData = async () => {
        try {
          const response = await fetch("/api/boards");
          if (!response.ok) {
            toast.error("Failed to fetch Board Data");
          }
          const result = await response.json();
          setBoardContextData(result?.result);
        } catch (error) {
          console.log(error);
          throw error;
        }
      };
      fetchBoardData();
    }
  }, [mode]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("https://amogaagents.morr.biz/User", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      const data = await response.json();
      if (data.length > 0) {
        const existingUser = data.find(
          (user: any) => user?.email === session?.user?.user_email
        );

        setUserChatSession(existingUser);
        if (!existingUser) {
          const newUser = await fetch("https://amogaagents.morr.biz/User", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify({
              email: session?.user?.user_email,
              mobile: session?.user?.user_mobile,
            }),
          });
        }
      }
    };
    fetchUsers();
  }, [session]);

  const fetchHistory = async (userChatSession: any, setHistory: any) => {
    const response = await fetch("https://amogaagents.morr.biz/Chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
    });
    if (!response.ok) {
      toast.error("Failed to fetch history");
      return;
    }
    const data = await response.json();
    const filteredData = data.filter(
      (item: any) => item.user_id == userChatSession?.id
    );
    setHistory(filteredData);
  };

  useEffect(() => {
    if (userChatSession) {
      fetchHistory(userChatSession, setHistory);
    }
  }, [userChatSession, openHistory]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!userChatSession?.id) return;

      try {
        const response = await fetch(
          "https://amogaagents.morr.biz/Message?bookmark=eq.true",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch bookmarks");
          return;
        }

        const data = await response.json();

        const filteredData = data.filter(
          (item: any) => item.user_id == userChatSession.id
        );

        setBookmarks(filteredData);
      } catch (error) {
        toast.error("Failed to fetch bookmarks");
      }
    };

    if (userChatSession?.id) {
      fetchBookmarks();
    }
  }, [openFavorites, userChatSession, refreshBookmarkState]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userChatSession?.id) return;

      try {
        const response = await fetch(
          "https://amogaagents.morr.biz/Message?favorite=eq.true",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          toast.error("Failed to fetch favorites");
          return;
        }

        const data = await response.json();

        const filteredData = data.filter(
          (item: any) => item.user_id == userChatSession.id
        );

        setFavorites(filteredData);
      } catch (error) {
        toast.error("Failed to fetch favorites");
      }
    };

    if (userChatSession?.id) {
      fetchFavorites();
    }
  }, [openFavorites, userChatSession, refreshBookmarkState]);

  useEffect(() => {
    if (chatId) {
      const fetchMessages = async () => {
        const response = await fetch(
          `https://amogaagents.morr.biz/Message?chatId=eq.${chatId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
          }
        );
        if (!response.ok) {
          toast.error("Failed to fetch messages");
          return;
        }
        const data = await response.json();
        const sortedData = data.sort((a: any, b: any) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setMessages(
          sortedData.map((msg: any) => ({
            id: msg.id,
            chatId: msg.chatId,
            createdAt: msg.createdAt,
            bookmark: msg.bookmark,
            isLike: msg.isLike,
            favorite: msg.favorite,
            text: msg.content,
            role: msg.role,
          }))
        );
      };
      fetchMessages();
    }
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      // Sort messages by createdAt timestamp (note: your data uses createdAt, not created_at)
      const sortedMessages = [...messages].sort((a, b) => {
        // If createdAt is available, use it for sorting
        if (a.createdAt && b.createdAt) {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        // Fallback to id if available
        if (a.id && b.id) {
          return a.id - b.id;
        }
        // If no reliable sorting field is available, maintain current order
        return 0;
      });

      // Only update if the order has changed
      if (
        JSON.stringify(sortedMessages.map((m) => m.id)) !==
        JSON.stringify(messages.map((m) => m.id))
      ) {
        setMessages(sortedMessages);
      }
    }
  }, [messages]);

  useEffect(() => {
    const getChatData = async () => {
      if (!chatId) return;
      const response = await fetch(
        `https://amogaagents.morr.biz/Chat?id=eq.${chatId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      setChatData(data);
    };
    getChatData();
  }, [chatId]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setAudioFile(file);

    // Upload to Vercel Blob via the same API endpoint
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/agent/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setAudioUrl(data.url);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio file");
    }
  };

  // Add this function to remove the audio file
  const removeAudio = () => {
    setAudioFile(null);
    setAudioUrl(null);
    if (audioInputRef.current) {
      audioInputRef.current.value = "";
    }
  };

  // Add this function to save audio document
  const saveAudioDocument = async (chatId: string, messageId: string) => {
    if (!audioUrl || !audioFile) return;

    const documentId = uuidv4();

    try {
      await fetch("https://amogaagents.morr.biz/Document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          id: documentId,
          chatId: chatId,
          agentMsgId: messageId,
          content: audioUrl,
          title: audioFile.name,
          kind: "audio",
          createdAt: new Date().toISOString(),
          user_id: userChatSession?.id,
        }),
      });
    } catch (error) {
      console.error("Error saving audio document:", error);
      toast.error("Failed to save audio details");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt && !fileUrl && !audioUrl) return;
    setIsLoading(true);

    // Generate a UUID for the new chat
    const newChatUuid = uuidv4();
    // Use existing chatId or the new one
    const currentChatId = chatId || newChatUuid;

    // Create a message ID for the user message
    const userMessageId = uuidv4();

    if (!chatId) {
      // Create a new chat
      const chatResponse = await fetch("https://amogaagents.morr.biz/Chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          createdAt: new Date().toISOString(),
          user_id: userChatSession?.id,
          id: newChatUuid,
          title: `New Chat`,
          status: "active",
        }),
      });

      if (!chatResponse.ok) {
        toast.error("Failed to create chat");
        setIsLoading(false);
        return;
      }
    }

    const fetchChatResponse = await fetch(
      `https://amogaagents.morr.biz/Chat?id=eq.${newChatUuid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      }
    );

    if (fetchChatResponse.ok) {
      const chatData = await fetchChatResponse.json();
      if (chatData.length > 0 && chatData[0].chatId) {
        // Update the chat with a title that includes the chatId
        await fetch(`https://amogaagents.morr.biz/Chat?id=eq.${newChatUuid}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            title: `Draft ${chatData[0].chatId}`,
          }),
        });
      }
    }

    const currentTimeStamp = new Date().toISOString();

    let userContent = prompt;
    if (fileUrl && uploadedFile) {
      if (prompt) {
        userContent = `${prompt}\n\nFile: ${uploadedFile.name} `;
      } else {
        userContent = `File: ${uploadedFile.name} `;
      }
    }

    if (audioUrl && audioFile) {
      if (userContent) {
        userContent = `${userContent}\n\nAudio: ${audioFile.name}`;
      } else {
        userContent = `Audio: ${audioFile.name} `;
      }
    }

    // Create a complete user message object
    const userMessage = {
      id: userMessageId,
      chatId: currentChatId,
      content: userContent,
      text: userContent,
      role: "user",
      createdAt: currentTimeStamp,
      user_id: userChatSession?.id,
      bookmark: null,
      isLike: null,
      favorite: null,
    };

    // Add user message to local state with complete data
    setMessages((prev) => [...prev, userMessage]);

    // Save user message to database
    await fetch("https://amogaagents.morr.biz/Message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        id: userMessageId,
        chatId: currentChatId,
        content: userContent,
        role: "user",
        createdAt: currentTimeStamp,
        user_id: userChatSession?.id,
      }),
    });

    if (fileUrl && uploadedFile) {
      await saveDocument(currentChatId, userMessageId);
    }

    if (audioUrl && audioFile) {
      await saveAudioDocument(currentChatId, userMessageId);
    }

    // Create a placeholder for assistant message
    const assistantMessageId = uuidv4();
    const assistantTimestamp = new Date(
      new Date(currentTimeStamp).getTime() + 1000
    ).toISOString();
    const assistantMessage = {
      id: assistantMessageId,
      chatId: currentChatId,
      content: "",
      text: "",
      role: "assistant",
      createdAt: assistantTimestamp,
      user_id: userChatSession?.id,
      bookmark: null,
      isLike: null,
      favorite: null,
    };

    // Add empty assistant message to show loading state
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Get AI response
      const response = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          boardContextData:
            boardContextData && mode === "chat_with_board" && boardContextData,
          fileUrl: fileUrl || null,
          audioUrl: audioUrl || null,
          chat_id: currentChatId,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let buffer = "";
      let aiResponse = "";

      // Process streaming response
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();

          if (line.startsWith("data:")) {
            const dataStr = line.replace(/^data:\s*/, "");

            if (dataStr === "[DONE]") {
              done = true;
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta;
              if (delta && delta.content) {
                aiResponse += delta.content;

                // Update the assistant message incrementally
                setMessages((prev) => {
                  const messages = [...prev];
                  if (
                    messages.length > 0 &&
                    messages[messages.length - 1].role === "assistant"
                  ) {
                    messages[messages.length - 1].text = aiResponse;
                    messages[messages.length - 1].content = aiResponse; // Update both fields
                  }
                  return messages;
                });
              }
            } catch (err) {
              console.error("Error parsing SSE data:", err);
            }
          }
        }

        buffer = lines[lines.length - 1];
      }

      // Save AI response to database
      if (aiResponse.trim()) {
        await fetch("https://amogaagents.morr.biz/Message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            id: assistantMessageId,
            chatId: currentChatId,
            content: aiResponse,
            role: "assistant",
            createdAt: assistantTimestamp,
            user_id: userChatSession?.id,
          }),
        });
      }

      // If this was a new chat, redirect to the chat page with the new chatId
      if (!chatId) {
        router.push(`/agent/${currentChatId}`);
      }

      setPrompt("");
      setFileUrl(null);
      setAudioUrl(null);
      setAudioFile(null);
      setUploadedFile(null);
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    } catch (error) {
      toast.error("Error fetching response");
      setIsLoading(false);
    }
  };

  // Add this function to handle title updates
  const handleUpdateTitle = async () => {
    if (!chatId || !editedTitle.trim()) return;

    try {
      const response = await fetch(
        `https://amogaagents.morr.biz/Chat?id=eq.${chatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            title: editedTitle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update chat title");
      }

      // Update local state to reflect the change
      if (chatData && chatData.length > 0) {
        setChatData([{ ...chatData[0], title: editedTitle }]);
      }

      toast.success("Chat title updated successfully");

      // Exit edit mode
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast.error("Failed to update chat title");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size exceeds 5MB limit");
      return;
    }

    setUploadedFile(file);
    setUploadError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/agent/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setFileUrl(data.url);
      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError("Failed to upload file. Please try again.");
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveDocument = async (chatId: string, messageId: string) => {
    if (!fileUrl || !uploadedFile) return;

    const documentId = uuidv4();

    try {
      await fetch("https://amogaagents.morr.biz/Document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          id: documentId,
          chatId: chatId,
          agentMsgId: messageId,
          content: fileUrl,
          kind: "file",
          title: uploadedFile.name,
          createdAt: new Date().toISOString(),
          user_id: userChatSession?.id,
        }),
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document details");
    }
  };

  const handleFavorite = async (message: any) => {
    try {
      const newFavoriteStatus = !message.favorite;

      // Update the message in the local state first for immediate UI feedback
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, favorite: newFavoriteStatus } : msg
        )
      );

      const response = await fetch(
        `https://amogaagents.morr.biz/Message?id=eq.${message.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=representation",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            favorite: newFavoriteStatus,
          }),
        }
      );

      if (!response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, favorite: !newFavoriteStatus }
              : msg
          )
        );
        toast.error("Failed to update favorite status");
        return;
      }

      // Trigger a refresh of the favorites list
      setRefreshBookmarkState((prev) => !prev);

      toast.success(
        newFavoriteStatus ? "Message favorited" : "Favorite removed"
      );
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const handleCopy = (message: any) => {
    navigator.clipboard.writeText(message.text);
    toast.success("Copied to clipboard");
  };

  useEffect(() => {
    if (chatData && chatData.length > 0 && chatData[0]?.title) {
      setEditedTitle(chatData[0].title);
    }
  }, [chatData]);

  // Add this effect to update messages when favorites are changed
  useEffect(() => {
    // Update the messages state to reflect changes in favorite status
    if (messages.length > 0) {
      setMessages((prevMessages) => {
        return prevMessages.map((message) => {
          // Check if this message is in the favorites list
          const isFavorite = favorites.some((fav) => fav.id === message.id);

          // Update the favorite status based on the favorites list
          if (isFavorite !== message.favorite) {
            return { ...message, favorite: isFavorite };
          }
          return message;
        });
      });
    }
  }, [favorites, refreshBookmarkState, messages.length]);

  const handleChatBookmark = async () => {
    if (!chatId) return;

    try {
      const newBookmarkStatus = !(chatData?.[0]?.bookmark || false);

      // Update local state for immediate UI feedback
      if (chatData && chatData.length > 0) {
        const updatedChatData = [...chatData];
        updatedChatData[0] = {
          ...updatedChatData[0],
          bookmark: newBookmarkStatus,
        };
        setChatData(updatedChatData);
      }

      const response = await fetch(
        `https://amogaagents.morr.biz/Chat?id=eq.${chatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=representation",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            bookmark: newBookmarkStatus,
          }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to update chat bookmark status");
        return;
      }

      // Refresh history to show updated bookmark status
      fetchHistory(userChatSession, setHistory);

      toast.success(
        newBookmarkStatus ? "Chat bookmarked" : "Chat bookmark removed"
      );
    } catch (error) {
      console.error("Error updating chat bookmark:", error);
      toast.error("Failed to update chat bookmark");
    }
  };

  const handleLike = async (message: any, type: string) => {
    console.log("feedback-----", message, type);
    try {
      let feedback;
      if (type === "like") {
        feedback = message.isLike === true ? null : true;
      } else {
        feedback = message.isLike === false ? null : false;
      }

      // Update the message in the local state first for immediate UI feedback
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, isLike: feedback } : msg
        )
      );

      const response = await fetch(
        `https://amogaagents.morr.biz/Message?id=eq.${message.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Prefer: "return=representation",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
          body: JSON.stringify({
            isLike: feedback,
          }),
        }
      );

      if (!response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id ? { ...msg, isLike: !feedback } : msg
          )
        );
        toast.error("Failed to update feedback status");
        return;
      }

      // Trigger a refresh of the favorites list
      setRefreshBookmarkState((prev) => !prev);

      toast.success(feedback ? "Message liked" : "Message disliked");
    } catch (error) {
      console.error("Error updating favorite:", error);
      toast.error("Failed to update feedback");
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        <h1 className="flex text-xl font-semibold items-center gap-2">
          <Bot className="w-5 h-5 text-muted-foreground" />
          {mode === "chat_with_board" ? "Chat with Board" : "General Assistant"}
        </h1>

        <div className="flex items-center justify-end gap-5">
          <Link href="/agent">
            <span className="text-muted-foreground cursor-pointer">
              <Plus className="w-5 h-5" />
            </span>
          </Link>
          <span
            className="text-muted-foreground cursor-pointer"
            onClick={() => setOpenHistory(true)}
          >
            <History className="w-5 h-5" />
          </span>
          <span
            className="text-muted-foreground cursor-pointer"
            onClick={() => setOpenFavorites(true)}
          >
            <Star className="w-5 h-5" />
          </span>
          <span
            className="text-muted-foreground cursor-pointer"
            onClick={() => setOpenMenu(true)}
          >
            <Menu className="w-5 h-5" />
          </span>
        </div>
      </div>
      {chatId && mode !== "chat_with_board" && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            type="text"
            value={isEditingTitle ? editedTitle : chatData?.[0]?.title}
            className={`border-0 w-fit max-w-[50% ] ${
              isEditingTitle ? "border border-primary" : ""
            }`}
            readOnly={!isEditingTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onFocus={() => {
              if (isEditingTitle && !editedTitle && chatData?.[0]?.title) {
                setEditedTitle(chatData[0].title);
              }
            }}
          />
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Check
                className="w-5 h-5 cursor-pointer"
                onClick={handleUpdateTitle}
              />
              <X
                className="w-5 h-5 cursor-pointer"
                onClick={() => {
                  setIsEditingTitle(false);
                  setEditedTitle("");
                }}
              />
            </div>
          ) : (
            <Edit
              className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary"
              onClick={() => {
                setIsEditingTitle(true);
                setEditedTitle(chatData?.[0]?.title || "");
              }}
            />
          )}
          <Bookmark
            className={`w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary ${
              chatData?.[0]?.bookmark ? "fill-primary text-primary" : ""
            }`}
            onClick={handleChatBookmark}
          />
        </div>
      )}

      <HistoryBar
        open={openHistory}
        setOpen={setOpenHistory}
        data={history}
        setDeleteHistory={setDeleteHistory}
        title="History"
        refreshHistory={() => fetchHistory(userChatSession, setHistory)}
      />
      <BookmarkBar
        open={openFavorites}
        setOpen={setOpenFavorites}
        // bookmarks={bookmarks}
        favorites={favorites}
        setRefreshState={setRefreshBookmarkState}
        title="Favorites"
      />
      <MenuBar
        open={openMenu}
        setOpen={setOpenMenu}
        data={getMenuData}
        setDeleteHistory={setDeleteHistory}
        title="Menu"
      />
      <div className="mt-4">
        <ScrollArea className="h-[calc(70vh-100px)] w-full relative">
          <div className="flex flex-col gap-4 w-full md:p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex items-center gap-2 w-full justify-start "
              >
                <div className="flex bg-secondary rounded-full h-10 w-10 flex-col items-center justify-center">
                  {message.role === "user" ? (
                    <p className="flex flex-col items-center justify-center">
                      {session?.user?.user_name?.[0].toUpperCase()}
                    </p>
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col w-full gap-2">
                  <div
                    className={` rounded-t-md rounded-l-lg p-3 ${
                      message.role === "user" ? "bg-muted" : "bg-muted"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <div>
                    {message.role === "assistant" && (
                      <div className="flex  md:ml-3 items-center gap-5">
                        <div className="flex items-center gap-5">
                          <Eye className="w-5 h-5 cursor-pointer text-muted-foreground" />
                          <Star
                            onClick={() => handleFavorite(message)}
                            className={`w-5 h-5 cursor-pointer text-muted-foreground ${
                              message.favorite
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                          <Copy
                            onClick={() => handleCopy(message)}
                            className="w-5 h-5 cursor-pointer text-muted-foreground"
                          />
                          <RefreshCw className="w-5 h-5 cursor-pointer text-muted-foreground" />
                          <Share2 className="w-5 h-5 cursor-pointer text-muted-foreground" />
                          {/* <Bookmark
                            className={`w-5 h-5 cursor-pointer text-muted-foreground ${
                              message.bookmark
                                ? "fill-primary border-primary"
                                : ""
                            }`}
                            onClick={() => handleBookmark(message)}
                          /> */}
                          <Edit className="w-5 h-5 cursor-pointer text-muted-foreground" />
                        </div>
                        <div className="flex items-center  gap-5 justify-end w-full">
                          <ThumbsUp
                            onClick={() => handleLike(message, "like")}
                            className={`w-5 h-5 ${
                              message.isLike === true &&
                              "fill-primary text-primary"
                            } cursor-pointer text-muted-foreground`}
                          />
                          <ThumbsDown
                            onClick={() => handleLike(message, "dislike")}
                            className={`w-5 h-5 ${
                              message.isLike === false &&
                              "fill-primary text-primary"
                            } cursor-pointer text-muted-foreground`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center h-full mt-5 justify-center"
        >
          <div className="border flex items-center rounded-full mt-10  p-2.5  w-full md:w-full">
            <Input
              placeholder="Type your message here..."
              className="bg-transparent border-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className=" justify-between flex items-center gap-2 ml-2">
              <div className="flex items-center gap-5 mr-3">
                <span className="text-muted-foreground cursor-pointer">
                  <Mic
                    className="w-5 h-5"
                    onClick={() => audioInputRef.current?.click()}
                  />
                  <input
                    type="file"
                    accept=".mp3,.mp4,.mov,.wmv,.avi"
                    className="hidden"
                    ref={audioInputRef}
                    onChange={handleAudioUpload}
                  />
                </span>
                {audioFile && (
                  <div className="flex items-center gap-2 p-2 border rounded-md mt-2">
                    <div className="flex-1 truncate">
                      <span className="text-sm font-medium">
                        {audioFile.name}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeAudio}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove audio</span>
                    </Button>
                  </div>
                )}
                {/* <FileUp
                    onClick={() => fileInputRef.current?.click()}
                    className="w-5 h-5"
                  /> */}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                {!uploadedFile ? (
                  <span
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center cursor-pointer border-none gap-2"
                  >
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                  </span>
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <div className="flex-1 truncate">
                      <span className="text-sm font-medium">
                        {uploadedFile.name}
                      </span>
                    </div>
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    )}
                  </div>
                )}

                {uploadError && (
                  <p className="text-sm text-red-500 mt-1">{uploadError}</p>
                )}
              </div>
              <div>
                <Button
                  disabled={(!prompt && !fileUrl && !audioUrl) || isLoading}
                  size="icon"
                  className="rounded-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          {mode === "chat_with_board" && (
            <Button
              onClick={() => router.back()}
              className="mt-4 w-full"
              variant={"outline"}
            >
              Close Chat
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AgentEditor;
