import { ChatMessage } from "@org/api-contract";
import { CheckCheckIcon, CheckIcon, ClockIcon } from "lucide-react";
import React from "react";
import { P, match } from "ts-pattern";

type MessageStatus = "optimistic" | "sent" | "read";
function getMessageStatus(message: ChatMessage): MessageStatus {
  return match(message)
    .returnType<MessageStatus>()
    .with({ id: P.string.startsWith("optimistic") }, () => "optimistic")
    .with({ readAt: P.nonNullable }, () => "read")
    .otherwise(() => "sent");
}

export const MessageStatusIcon: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const messageStatus = getMessageStatus(message);

  switch (messageStatus) {
    case "optimistic":
      return <ClockIcon className="size-3" />;
    case "sent":
      return <CheckIcon className="size-3" />;
    case "read":
      return <CheckCheckIcon className="size-3" />;
  }
};
