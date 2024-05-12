import React from "react";
import { ChatFooter } from "./chat-footer";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";

export const Chat: React.FC = () => {
  return (
    <div className="flex flex-auto flex-col h-screen">
      <ChatHeader />

      <MessageList />

      <ChatFooter />
    </div>
  );
};
