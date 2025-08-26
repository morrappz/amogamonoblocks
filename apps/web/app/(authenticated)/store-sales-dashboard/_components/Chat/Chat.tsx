"use client";
import React from "react";
import ChatwithBoard from "./ChatwithBoard";
import ChatHeader from "./ChatHeader";

const Chat = ({ chatId }: { chatId: string }) => {
  const [openHistory, setOpenHistory] = React.useState(false);
  const [openFavorite, setOpenFavorite] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);
  const [usage, setUsage] = React.useState({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  });
  return (
    <div className="flex  w-full flex-col">
      <ChatHeader
        setOpenHistory={setOpenHistory}
        setOpenFavorite={setOpenFavorite}
        setOpenMenu={setOpenMenu}
        usage={usage}
      />
      <ChatwithBoard
        chatId={chatId}
        openHistory={openHistory}
        openFavorite={openFavorite}
        setOpenHistory={setOpenHistory}
        setOpenFavorite={setOpenFavorite}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        setUsage={setUsage}
      />
    </div>
  );
};

export default Chat;
