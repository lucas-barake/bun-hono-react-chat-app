import { Button } from "@/components/button";
import { Input } from "@/components/input";
import React from "react";
import { useSendMessageMutation } from "@/lib/data-access/use-send-message-mutation";

export const ChatFooter: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const sendMessageMutation = useSendMessageMutation();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage === "") return;

    setMessage("");
    sendMessageMutation.mutate({ message: trimmedMessage });
  }

  return (
    <form className="flex items-center space-x-2 p-2 border-t" onSubmit={onSubmit}>
      <Input
        className="flex-1"
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button type="submit" size="sm" variant="outline">
        Send
      </Button>
    </form>
  );
};
