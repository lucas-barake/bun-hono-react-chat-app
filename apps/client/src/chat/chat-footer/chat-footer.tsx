import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { client } from "@/lib/client";
import { useSenderSession } from "@/lib/use-sender-session";
import React from "react";

export const ChatFooter: React.FC = () => {
  const [message, setMessage] = React.useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage === "") return;

    client.chat.$post({
      json: {
        as: useSenderSession.getState().as,
        content: trimmedMessage,
        createdAt: new Date().toISOString(),
      },
    });

    setMessage("");
  }

  return (
    <form className="flex items-center space-x-2 p-2 border-t" onSubmit={onSubmit}>
      <Input className="flex-1" placeholder="Type a message" value={message} onChange={(e) => setMessage(e.target.value)} />

      <Button type="submit" size="sm" variant="outline">
        Send
      </Button>
    </form>
  );
};
