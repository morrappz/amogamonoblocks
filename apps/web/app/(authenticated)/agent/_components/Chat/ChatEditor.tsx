/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Bookmark,
  Bot,
  Check,
  Edit,
  History,
  Loader2,
  Menu,
  Plus,
  RefreshCw,
  Star,
  User,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HistoryBar from "@/app/(authenticated)/agent/_components/SideBar/History";
import MenuBar from "@/app/(authenticated)/agent/_components/SideBar/Menu";
import BookmarkBar from "@/app/(authenticated)/agent/_components/SideBar/Bookmark";

import { SAVE_FORM_FIELDS } from "@/constants/envConfig";
import axiosInstance from "@/utils/axiosInstance";
import { Card } from "@/components/ui/card";
import CardRender from "./Card";
import TablesRendered from "./TablesRendered";
import { Avatar } from "@/components/ui/avatar";
import { FaArrowUp } from "react-icons/fa";
import ChatHistory from "./ChatSideBar/ChatHistory";

const favoritePrompts = [
  { id: 1, text: "Explain quantum computing in simple terms" },
  { id: 2, text: "Write a poem about artificial intelligence" },
  { id: 3, text: "Describe the process of photosynthesis" },
  { id: 4, text: "Compare and contrast renewable energy sources" },
  { id: 5, text: "Outline the major events of World War II" },
];

const ChatEditor = ({ field, chatId }: { field: any; chatId?: string }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [openHistory, setOpenHistory] = useState<boolean>(false);
  const [openFavorites, setOpenFavorites] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [history, setHistory] = useState<any[]>([]);
  const [likes, setLikes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  const [cardField, setCardField] = useState<any>(field);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [componentName, setComponentName] = useState<any>(null);
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    if (field) {
      setCardField(field);
    }
  }, [field]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!chatId && userChatSession?.id && field) {
        // Generate a UUID for the new chat
        const newChatUuid = uuidv4();
        const chatCode = `Agent_${Math.random().toString().slice(-4)}`;

        try {
          // Create a new chat
          await fetch("https://amogaagents.morr.biz/Chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify({
              createdAt: new Date().toISOString(),
              user_id: userChatSession?.id,
              id: newChatUuid,
              form_name: field?.form_name,
              form_code: field?.form_code,
              chat_session: [
                `${session?.user?.business_number},${field?.form_name},${chatCode},${session?.user?.user_name}`,
              ],
              chat_code: chatCode,
              form_id: field?.form_id,
            }),
          });

          // Redirect to the new chat URL
          router.push(`/agent/Chat/${field?.form_id}/${newChatUuid}`);
        } catch (error) {
          console.error("Error creating chat:", error);
          toast.error("Failed to create new chat");
        }
      }
    };

    initializeChat();
  }, [chatId, userChatSession?.id, field, session, router]);

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

  // Add message helper function
  const addMessage = (role: "user" | "assistant", content: React.ReactNode) => {
    setMessages((prev) => [...prev, { id: uuidv4(), role, content }]);
  };

  useEffect(() => {
    if (messages.length === 0 && cardField) {
      // Add cardField check
      const messageContent = (
        <div className="flex w-full items-center">
          <CardRender
            key={JSON.stringify(cardField)} // Add key to force re-render
            field={cardField}
            setLoading={setLoading}
            setResults={setResults}
            setColumns={setColumns}
            setChartConfig={setChartConfig}
            setComponentName={setComponentName}
            setApiData={setApiData}
            session={session}
            handleRadioChange={(value: any) => {
              setSelectedValue(value);
              setCardField((prev: any) => {
                const updated = {
                  ...prev,
                  cardui_json: [
                    {
                      ...prev.cardui_json[0],
                      chat_with_data: {
                        ...prev.cardui_json[0]?.chat_with_data,
                        preference: value,
                      },
                    },
                  ],
                };
                return updated;
              });
            }}
          />
        </div>
      );
      addMessage("assistant", messageContent);
    }
  }, [cardField, messages.length, session]);

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
          (user: any) => user?.user_email === session?.user?.user_email
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
          const newUserData = await newUser.json();
          setUserChatSession(newUserData);
        }
      }
    };
    fetchUsers();
  }, [session]);

  const fetchHistory = async (userChatSession: any, setHistory: any) => {
    try {
      const response = await fetch(
        `https://amogaagents.morr.biz/Chat?form_name=neq.null`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Failed to fetch history");
        return;
      }

      const data = await response.json();

      // Sort messages by creation timestamp
      const sortedMessages = data.sort((a: any, b: any) => {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      // Map the messages to include all necessary fields
      const formattedMessages = sortedMessages.map((msg: any) => ({
        id: msg.id,
        chatId: msg.chatId,
        content: msg.content,
        role: msg.role,
        status: msg.status,
        createdAt: msg.createdAt,
        user_id: msg.user_id,
        bookmark: msg.bookmark,
        isLike: msg.isLike,
        favorite: msg.favorite,
        response_data_json: msg.response_data_json,
        prompt_json: msg.prompt_json,
        form_name: msg.form_name,
        form_code: msg.form_code,
        chat_code: msg.chat_code,
        form_id: msg.form_id,
      }));

      setHistory(formattedMessages);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    if (chatId && userChatSession) {
      fetchHistory(userChatSession, setHistory);
    }
  }, [chatId, userChatSession]);

  //   useEffect(() => {
  //     const fetchBookmarks = async () => {
  //       if (!userChatSession?.id) return;

  //       try {
  //         const response = await fetch(
  //           "https://amogaagents.morr.biz/Message?bookmark=eq.true",
  //           {
  //             method: "GET",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //             },
  //           }
  //         );

  //         if (!response.ok) {
  //           toast({
  //             description: "Failed to fetch bookmarks",
  //             variant: "destructive",
  //           });
  //           return;
  //         }

  //         const data = await response.json();

  //         const filteredData = data.filter(
  //           (item: any) => item.user_id == userChatSession.id
  //         );

  //         setBookmarks(filteredData);
  //       } catch (error) {
  //         toast({
  //           description: "Failed to fetch bookmarks",
  //           variant: "destructive",
  //         });
  //       }
  //     };

  //     if (userChatSession?.id) {
  //       fetchBookmarks();
  //     }
  //   }, [openFavorites, userChatSession, refreshBookmarkState]);

  //   useEffect(() => {
  //     const fetchFavorites = async () => {
  //       if (!userChatSession?.id) return;

  //       try {
  //         const response = await fetch(
  //           "https://amogaagents.morr.biz/Message?favorite=eq.true",
  //           {
  //             method: "GET",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //             },
  //           }
  //         );

  //         if (!response.ok) {
  //           toast({
  //             description: "Failed to fetch favorites",
  //             variant: "destructive",
  //           });
  //           return;
  //         }

  //         const data = await response.json();

  //         const filteredData = data.filter(
  //           (item: any) => item.user_id == userChatSession.id
  //         );

  //         setFavorites(filteredData);
  //       } catch (error) {
  //         toast({
  //           description: "Failed to fetch favorites",
  //           variant: "destructive",
  //         });
  //       }
  //     };

  //     if (userChatSession?.id) {
  //       fetchFavorites();
  //     }
  //   }, [openFavorites, userChatSession, refreshBookmarkState]);

  //   useEffect(() => {
  //     if (field?.id) {
  //       const fetchMessages = async () => {
  //         const response = await fetch(
  //           `https://amogaagents.morr.biz/Message?chatId=eq.${field?.id}`,
  //           {
  //             method: "GET",
  //             headers: {
  //               "Content-Type": "application/json",
  //               Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //             },
  //           }
  //         );
  //         if (!response.ok) {
  //           toast({
  //             description: "Failed to fetch messages",
  //             variant: "destructive",
  //           });
  //           return;
  //         }
  //         const data = await response.json();
  //         const sortedData = data.sort((a: any, b: any) => {
  //           return (
  //             new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  //           );
  //         });
  //         setMessages(
  //           sortedData.map((msg: any) => ({
  //             id: msg.id,
  //             chatId: msg.chatId,
  //             createdAt: msg.createdAt,
  //             bookmark: msg.bookmark,
  //             isLike: msg.isLike,
  //             favorite: msg.favorite,
  //             text: msg.content,
  //             role: msg.role,
  //           }))
  //         );
  //       };
  //       fetchMessages();
  //     }
  //   }, [field?.id]);

  //   useEffect(() => {
  //     if (messages.length > 0) {
  //       // Sort messages by createdAt timestamp (note: your data uses createdAt, not created_at)
  //       const sortedMessages = [...messages].sort((a, b) => {
  //         // If createdAt is available, use it for sorting
  //         if (a.createdAt && b.createdAt) {
  //           return (
  //             new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  //           );
  //         }
  //         // Fallback to id if available
  //         if (a.id && b.id) {
  //           return a.id - b.id;
  //         }
  //         // If no reliable sorting field is available, maintain current order
  //         return 0;
  //       });

  //       // Only update if the order has changed
  //       if (
  //         JSON.stringify(sortedMessages.map((m) => m.id)) !==
  //         JSON.stringify(messages.map((m) => m.id))
  //       ) {
  //         setMessages(sortedMessages);
  //       }
  //     }
  //   }, [messages]);

  //   useEffect(() => {
  //     const getChatData = async () => {
  //       if (!field?.id) return;
  //       const response = await fetch(
  //         `https://amogaagents.morr.biz/Chat?id=eq.${field?.id}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //         }
  //       );
  //       const data = await response.json();
  //       setChatData(data);
  //     };
  //     getChatData();
  //   }, [field?.id]);

  //   const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     if (!e.target.files || e.target.files.length === 0) return;

  //     const file = e.target.files[0];
  //     setAudioFile(file);

  //     // Upload to Vercel Blob via the same API endpoint
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const response = await fetch("/api/upload", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       if (!response.ok) {
  //         throw new Error("Upload failed");
  //       }

  //       const data = await response.json();
  //       setAudioUrl(data.url);
  //     } catch (error) {
  //       console.error("Error uploading audio:", error);
  //       toast({
  //         description: "Failed to upload audio file",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   // Add this function to remove the audio file
  //   const removeAudio = () => {
  //     setAudioFile(null);
  //     setAudioUrl(null);
  //     if (audioInputRef.current) {
  //       audioInputRef.current.value = "";
  //     }
  //   };

  //   // Add this function to save audio document
  //   const saveAudioDocument = async (chatId: string, messageId: string) => {
  //     if (!audioUrl || !audioFile) return;

  //     const documentId = uuidv4();

  //     try {
  //       await fetch("https://amogaagents.morr.biz/Document", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //         },
  //         body: JSON.stringify({
  //           id: documentId,
  //           chatId: chatId,
  //           agentMsgId: messageId,
  //           content: audioUrl,
  //           title: audioFile.name,
  //           kind: "audio",
  //           createdAt: new Date().toISOString(),
  //           user_id: userChatSession?.id,
  //         }),
  //       });
  //     } catch (error) {
  //       console.error("Error saving audio document:", error);
  //       toast({
  //         description: "Failed to save audio details",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     if (!prompt && !fileUrl && !audioUrl) return;
  //     setIsLoading(true);

  //     // Generate a UUID for the new chat
  //     const newChatUuid = uuidv4();
  //     // Use existing chatId or the new one
  //     const currentChatId = field?.id || newChatUuid;

  //     // Create a message ID for the user message
  //     const userMessageId = uuidv4();

  //     if (!field?.id) {
  //       // Create a new chat
  //       const chatResponse = await fetch("https://amogaagents.morr.biz/Chat", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //         },
  //         body: JSON.stringify({
  //           createdAt: new Date().toISOString(),
  //           user_id: userChatSession?.id,
  //           id: newChatUuid,
  //           title: `New Chat`,
  //           status: "active",
  //         }),
  //       });

  //       if (!chatResponse.ok) {
  //         toast({
  //           description: "Failed to create chat",
  //           variant: "destructive",
  //         });
  //         setIsLoading(false);
  //         return;
  //       }
  //     }

  //     const fetchChatResponse = await fetch(
  //       `https://amogaagents.morr.biz/Chat?id=eq.${newChatUuid}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //         },
  //       }
  //     );

  //     if (fetchChatResponse.ok) {
  //       const chatData = await fetchChatResponse.json();
  //       if (chatData.length > 0 && chatData[0].chatId) {
  //         // Update the chat with a title that includes the chatId
  //         await fetch(`https://amogaagents.morr.biz/Chat?id=eq.${newChatUuid}`, {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //           body: JSON.stringify({
  //             title: `Draft ${chatData[0].chatId}`,
  //           }),
  //         });
  //       }
  //     }

  //     const currentTimeStamp = new Date().toISOString();

  //     let userContent = prompt;
  //     if (fileUrl && uploadedFile) {
  //       if (prompt) {
  //         userContent = `${prompt}\n\nFile: ${uploadedFile.name} `;
  //       } else {
  //         userContent = `File: ${uploadedFile.name} `;
  //       }
  //     }

  //     if (audioUrl && audioFile) {
  //       if (userContent) {
  //         userContent = `${userContent}\n\nAudio: ${audioFile.name}`;
  //       } else {
  //         userContent = `Audio: ${audioFile.name} `;
  //       }
  //     }

  //     // Create a complete user message object
  //     const userMessage = {
  //       id: userMessageId,
  //       chatId: currentChatId,
  //       content: userContent,
  //       text: userContent,
  //       role: "user",
  //       createdAt: currentTimeStamp,
  //       user_id: userChatSession?.id,
  //       bookmark: null,
  //       isLike: null,
  //       favorite: null,
  //     };

  //     // Add user message to local state with complete data
  //     setMessages((prev) => [...prev, userMessage]);

  //     // Save user message to database
  //     await fetch("https://amogaagents.morr.biz/Message", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         id: userMessageId,
  //         chatId: currentChatId,
  //         content: userContent,
  //         role: "user",
  //         createdAt: currentTimeStamp,
  //         user_id: userChatSession?.id,
  //       }),
  //     });

  //     if (fileUrl && uploadedFile) {
  //       await saveDocument(currentChatId, userMessageId);
  //     }

  //     if (audioUrl && audioFile) {
  //       await saveAudioDocument(currentChatId, userMessageId);
  //     }

  //     // Create a placeholder for assistant message
  //     const assistantMessageId = uuidv4();
  //     const assistantTimestamp = new Date(
  //       new Date(currentTimeStamp).getTime() + 1000
  //     ).toISOString();
  //     const assistantMessage = {
  //       id: assistantMessageId,
  //       chatId: currentChatId,
  //       content: "",
  //       text: "",
  //       role: "assistant",
  //       createdAt: assistantTimestamp,
  //       user_id: userChatSession?.id,
  //       bookmark: null,
  //       isLike: null,
  //       favorite: null,
  //     };

  //     // Add empty assistant message to show loading state
  //     setMessages((prev) => [...prev, assistantMessage]);

  //     try {
  //       // Get AI response
  //       const response = await fetch("/api/generate", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           prompt,
  //           fileUrl: fileUrl || null,
  //           audioUrl: audioUrl || null,
  //           chat_id: currentChatId,
  //         }),
  //       });

  //       if (!response.body) throw new Error("No response body");

  //       const reader = response.body.getReader();
  //       const decoder = new TextDecoder("utf-8");

  //       let done = false;
  //       let buffer = "";
  //       let aiResponse = "";

  //       // Process streaming response
  //       while (!done) {
  //         const { value, done: doneReading } = await reader.read();
  //         done = doneReading;

  //         buffer += decoder.decode(value, { stream: true });

  //         const lines = buffer.split("\n");
  //         for (let i = 0; i < lines.length - 1; i++) {
  //           const line = lines[i].trim();

  //           if (line.startsWith("data:")) {
  //             const dataStr = line.replace(/^data:\s*/, "");

  //             if (dataStr === "[DONE]") {
  //               done = true;
  //               break;
  //             }

  //             try {
  //               const parsed = JSON.parse(dataStr);
  //               const delta = parsed.choices?.[0]?.delta;
  //               if (delta && delta.content) {
  //                 aiResponse += delta.content;

  //                 // Update the assistant message incrementally
  //                 setMessages((prev) => {
  //                   const messages = [...prev];
  //                   if (
  //                     messages.length > 0 &&
  //                     messages[messages.length - 1].role === "assistant"
  //                   ) {
  //                     messages[messages.length - 1].text = aiResponse;
  //                     messages[messages.length - 1].content = aiResponse; // Update both fields
  //                   }
  //                   return messages;
  //                 });
  //               }
  //             } catch (err) {
  //               console.error("Error parsing SSE data:", err);
  //             }
  //           }
  //         }

  //         buffer = lines[lines.length - 1];
  //       }

  //       // Save AI response to database
  //       if (aiResponse.trim()) {
  //         await fetch("https://amogaagents.morr.biz/Message", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //           body: JSON.stringify({
  //             id: assistantMessageId,
  //             chatId: currentChatId,
  //             content: aiResponse,
  //             role: "assistant",
  //             createdAt: assistantTimestamp,
  //             user_id: userChatSession?.id,
  //           }),
  //         });
  //       }

  //       // If this was a new chat, redirect to the chat page with the new chatId
  //       if (!field?.id) {
  //         router.push(`/Agent/${currentChatId}`);
  //       }

  //       setPrompt("");
  //       setFileUrl(null);
  //       setAudioUrl(null);
  //       setAudioFile(null);
  //       setUploadedFile(null);
  //       setIsLoading(false);
  //       if (fileInputRef.current) {
  //         fileInputRef.current.value = "";
  //       }
  //       if (audioInputRef.current) {
  //         audioInputRef.current.value = "";
  //       }
  //     } catch (error) {
  //       toast({ description: "Error fetching response", variant: "destructive" });
  //       setIsLoading(false);
  //     }
  //   };

  //   // Add this function to handle title updates
  //   const handleUpdateTitle = async () => {
  //     if (!field?.id || !editedTitle.trim()) return;

  //     try {
  //       const response = await fetch(
  //         `https://amogaagents.morr.biz/Chat?id=eq.${field?.id}`,
  //         {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //           body: JSON.stringify({
  //             title: editedTitle,
  //           }),
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to update chat title");
  //       }

  //       // Update local state to reflect the change
  //       if (chatData && chatData.length > 0) {
  //         setChatData([{ ...chatData[0], title: editedTitle }]);
  //       }

  //       toast({
  //         description: "Chat title updated successfully",
  //       });

  //       // Exit edit mode
  //       setIsEditingTitle(false);
  //     } catch (error) {
  //       console.error("Error updating chat title:", error);
  //       toast({
  //         description: "Failed to update chat title",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //     if (!e.target.files || e.target.files.length === 0) return;

  //     const file = e.target.files[0];
  //     const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  //     if (file.size > MAX_FILE_SIZE) {
  //       setUploadError("File size exceeds 5MB limit");
  //       return;
  //     }

  //     setUploadedFile(file);
  //     setUploadError(null);
  //     setIsUploading(true);

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const response = await fetch("/api/upload", {
  //         method: "POST",
  //         body: formData,
  //       });

  //       if (!response.ok) {
  //         throw new Error("Upload failed");
  //       }

  //       const data = await response.json();
  //       setFileUrl(data.url);
  //       setIsUploading(false);
  //     } catch (error) {
  //       console.error("Upload error:", error);
  //       setUploadError("Failed to upload file. Please try again.");
  //       setIsUploading(false);
  //     }
  //   };

  //   const removeFile = () => {
  //     setUploadedFile(null);
  //     setFileUrl(null);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }
  //   };

  //   const saveDocument = async (chatId: string, messageId: string) => {
  //     if (!fileUrl || !uploadedFile) return;

  //     const documentId = uuidv4();

  //     try {
  //       await fetch("https://amogaagents.morr.biz/Document", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //         },
  //         body: JSON.stringify({
  //           id: documentId,
  //           chatId: chatId,
  //           agentMsgId: messageId,
  //           content: fileUrl,
  //           kind: "file",
  //           title: uploadedFile.name,
  //           createdAt: new Date().toISOString(),
  //           user_id: userChatSession?.id,
  //         }),
  //       });
  //     } catch (error) {
  //       console.error("Error saving document:", error);
  //       toast({
  //         description: "Failed to save document details",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  // const handleBookmark = async (message: any) => {
  //   try {
  //     const newBookmarkStatus = !message.bookmark;

  //     // Update the message in the local state first for immediate UI feedback
  //     setMessages((prev) =>
  //       prev.map((msg) =>
  //         msg.id === message.id ? { ...msg, bookmark: newBookmarkStatus } : msg
  //       )
  //     );

  //     const response = await fetch(
  //       `https://amogaagents.morr.biz/Message?id=eq.${message.id}`,
  //       {
  //         method: "PATCH",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Prefer: "return=representation",
  //           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //         },
  //         body: JSON.stringify({
  //           bookmark: newBookmarkStatus,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       toast({
  //         description: "Failed to update bookmark status",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     // Trigger a refresh of the bookmarks list
  //     setRefreshBookmarkState((prev) => !prev);

  //     toast({
  //       description: newBookmarkStatus
  //         ? "Message bookmarked"
  //         : "Bookmark removed",
  //     });
  //   } catch (error) {
  //     console.error("Error updating bookmark:", error);
  //     toast({
  //       description: "Failed to update bookmark",
  //       variant: "destructive",
  //     });
  //   }
  // };

  //   const handleFavorite = async (message: any) => {
  //     try {
  //       const newFavoriteStatus = !message.favorite;

  //       // Update the message in the local state first for immediate UI feedback
  //       setMessages((prev) =>
  //         prev.map((msg) =>
  //           msg.id === message.id ? { ...msg, favorite: newFavoriteStatus } : msg
  //         )
  //       );

  //       const response = await fetch(
  //         `https://amogaagents.morr.biz/Message?id=eq.${message.id}`,
  //         {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Prefer: "return=representation",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //           body: JSON.stringify({
  //             favorite: newFavoriteStatus,
  //           }),
  //         }
  //       );

  //       if (!response.ok) {
  //         setMessages((prev) =>
  //           prev.map((msg) =>
  //             msg.id === message.id
  //               ? { ...msg, favorite: !newFavoriteStatus }
  //               : msg
  //           )
  //         );
  //         toast({
  //           description: "Failed to update favorite status",
  //           variant: "destructive",
  //         });
  //         return;
  //       }

  //       // Trigger a refresh of the favorites list
  //       setRefreshBookmarkState((prev) => !prev);

  //       toast({
  //         description: newFavoriteStatus
  //           ? "Message favorited"
  //           : "Favorite removed",
  //       });
  //     } catch (error) {
  //       console.error("Error updating favorite:", error);
  //       toast({
  //         description: "Failed to update favorite",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   const handleCopy = (message: any) => {
  //     navigator.clipboard.writeText(message.text);
  //     toast({
  //       description: "Copied to clipboard",
  //     });
  //   };

  //   useEffect(() => {
  //     if (chatData && chatData.length > 0 && chatData[0]?.title) {
  //       setEditedTitle(chatData[0].title);
  //     }
  //   }, [chatData]);

  //   // Add this effect to update messages when favorites are changed
  //   useEffect(() => {
  //     // Update the messages state to reflect changes in favorite status
  //     if (messages.length > 0) {
  //       setMessages((prevMessages) => {
  //         return prevMessages.map((message) => {
  //           // Check if this message is in the favorites list
  //           const isFavorite = favorites.some((fav) => fav.id === message.id);

  //           // Update the favorite status based on the favorites list
  //           if (isFavorite !== message.favorite) {
  //             return { ...message, favorite: isFavorite };
  //           }
  //           return message;
  //         });
  //       });
  //     }
  //   }, [favorites, refreshBookmarkState, messages.length]);

  //   const handleChatBookmark = async () => {
  //     if (!field?.id) return;

  //     try {
  //       const newBookmarkStatus = !(chatData?.[0]?.bookmark || false);

  //       // Update local state for immediate UI feedback
  //       if (chatData && chatData.length > 0) {
  //         const updatedChatData = [...chatData];
  //         updatedChatData[0] = {
  //           ...updatedChatData[0],
  //           bookmark: newBookmarkStatus,
  //         };
  //         setChatData(updatedChatData);
  //       }

  //       const response = await fetch(
  //         `https://amogaagents.morr.biz/Chat?id=eq.${field?.id}`,
  //         {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Prefer: "return=representation",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //           body: JSON.stringify({
  //             bookmark: newBookmarkStatus,
  //           }),
  //         }
  //       );

  //       if (!response.ok) {
  //         toast({
  //           description: "Failed to update chat bookmark status",
  //           variant: "destructive",
  //         });
  //         return;
  //       }

  //       // Refresh history to show updated bookmark status
  //       fetchHistory(userChatSession, setHistory);

  //       toast({
  //         description: newBookmarkStatus
  //           ? "Chat bookmarked"
  //           : "Chat bookmark removed",
  //       });
  //     } catch (error) {
  //       console.error("Error updating chat bookmark:", error);
  //       toast({
  //         description: "Failed to update chat bookmark",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  //   const handleLike = async (message: any, type: string) => {
  //     console.log("feedback-----", message, type);
  //     try {
  //       let feedback;
  //       if (type === "like") {
  //         feedback = message.isLike === true ? null : true;
  //       } else {
  //         feedback = message.isLike === false ? null : false;
  //       }

  //       // Update the message in the local state first for immediate UI feedback
  //       setMessages((prev) =>
  //         prev.map((msg) =>
  //           msg.id === message.id ? { ...msg, isLike: feedback } : msg
  //         )
  //       );

  //       const response = await fetch(
  //         `https://amogaagents.morr.biz/Message?id=eq.${message.id}`,
  //         {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //             Prefer: "return=representation",
  //             Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  //           },
  //           body: JSON.stringify({
  //             isLike: feedback,
  //           }),
  //         }
  //       );

  //       if (!response.ok) {
  //         setMessages((prev) =>
  //           prev.map((msg) =>
  //             msg.id === message.id ? { ...msg, isLike: !feedback } : msg
  //           )
  //         );
  //         toast({
  //           description: "Failed to update feedback status",
  //           variant: "destructive",
  //         });
  //         return;
  //       }

  //       // Trigger a refresh of the favorites list
  //       setRefreshBookmarkState((prev) => !prev);

  //       toast({
  //         description: feedback ? "Message liked" : "Message disliked",
  //       });
  //     } catch (error) {
  //       console.error("Error updating favorite:", error);
  //       toast({
  //         description: "Failed to update feedback",
  //         variant: "destructive",
  //       });
  //     }
  //   };

  const handleSubmit = async () => {
    if (!selectedValue) return;
    setIsLoading(true);

    try {
      // Get chat details
      const chatResponse = await fetch(
        `https://amogaagents.morr.biz/Chat?id=eq.${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const chatData = await chatResponse.json();
      const currentChat = chatData[0];

      // Prepare prompt JSON
      const selectedButton =
        field?.cardui_json?.[0]?.chat_with_data?.buttons.find(
          (button: any) => button.button_text === selectedValue
        );

      // Prepare prompt JSON with proper structure
      const promptJson = {
        action: selectedButton?.button_text || selectedValue,
        prompt: selectedButton?.prompt || "",
        datetime: new Date().toISOString(),
      };

      // Prepare response data JSON
      const responseDataJson = {
        form_id: field?.form_id,
        results,
        columns,
        chartConfig,
        componentName,
        apiData,
      };

      // Save message to API
      await fetch("https://amogaagents.morr.biz/Message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          id: uuidv4(),
          chatId: currentChat.id,
          prompt_json: promptJson,
          response_data_json: responseDataJson,
          chat_session: currentChat.chat_session,
          createdAt: new Date().toISOString(),
          user_id: session?.user?.user_catalog_id,
        }),
      });

      // Update UI with messages
      setMessages([
        {
          id: uuidv4(),
          role: "assistant",
          content: (
            <div className="flex flex-col">
              <span className="font-medium">
                {JSON.parse(field?.label) || "Please select your preference"}
              </span>
              {JSON.parse(field?.description) && (
                <span className="text-sm text-muted-foreground">
                  {JSON.parse(field?.description)}
                </span>
              )}
            </div>
          ),
        },
      ]);

      // Add user message with TablesRendered
      addMessage(
        "user",
        <div className="flex w-full overflow-x-auto items-center">
          <TablesRendered
            results={results}
            columns={columns}
            currentField={cardField}
            chartConfig={chartConfig}
            componentName={componentName}
            apiData={apiData}
            preference={selectedValue}
          />
        </div>
      );

      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("An error occurred while saving the message");
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    // Reset all states
    setSelectedValue("");
    setResults([]);
    setColumns([]);
    setChartConfig(null);
    setComponentName(null);
    setApiData(null);

    // Reset messages to show CardRender
    setMessages([
      {
        id: uuidv4(),
        role: "assistant",
        content: (
          <div className="flex w-full overflow-x-auto md:w-[80vw] items-center">
            <CardRender
              field={field}
              handleRadioChange={(value: any) => setSelectedValue(value)}
              setLoading={setLoading}
              setResults={setResults}
              setColumns={setColumns}
              setChartConfig={setChartConfig}
              setComponentName={setComponentName}
              setApiData={setApiData}
              session={session}
            />
          </div>
        ),
      },
    ]);
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        <Link href="/agent">
          <h1 className="flex text-xl font-semibold items-center gap-2">
            <Bot className="w-5 h-5 text-muted-foreground" />
            Chat with Data JSON
          </h1>
        </Link>
        <div className="flex items-center justify-end gap-5">
          <span
            className="text-muted-foreground cursor-pointer"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-5 h-5" />
          </span>
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
      {field?.id && (
        <div className="flex items-center gap-2 mt-2">
          <Input
            type="text"
            value={isEditingTitle ? editedTitle : field?.form_name}
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
                // onClick={handleUpdateTitle}
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
            // onClick={handleChatBookmark}
          />
        </div>
      )}

      <ChatHistory
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

      <div className="flex flex-col space-y-4 w-full">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } items-end`}
            >
              {message.role === "assistant" && (
                <Avatar className="mr-2">
                  <Bot className="h-5 w-5" />
                </Avatar>
              )}
              <div
                className={`w-full  rounded-lg p-4 ${
                  message.role === "assistant"
                    ? "bg-secondary w-full"
                    : "bg-secondary overflow-x-auto text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="ml-2">
                  <User className="h-5 w-5" />
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {selectedValue && (
          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <div>
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <FaArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* <div className="mt-4">
        <CardRender field={field} />
        <Button onClick={handleSubmit}>Submit</Button>
      </div> */}
    </div>
  );
};

export default ChatEditor;
