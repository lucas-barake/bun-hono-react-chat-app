import { ScrollArea } from "@/components/scroll-area";
import React from "react";
import { MessageBubble } from "./message-bubble";
import { ChatMessage } from "@org/api-contract";
import { client } from "@/lib/client";

export const MessageList: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  React.useEffect(() => {
    client.chat
      .$get()
      .then((res) => res.json())
      .then(setMessages);
  }, []);

  return (
    <ScrollArea className="relative flex-1 overflow-y-hidden px-6">
      <ScrollArea.Viewport className="pt-4">
        {messages.map((message, i) => (
          <MessageBubble key={i} message={message} />
        ))}

        <div className="h-4" />
      </ScrollArea.Viewport>
    </ScrollArea>
  );
};
