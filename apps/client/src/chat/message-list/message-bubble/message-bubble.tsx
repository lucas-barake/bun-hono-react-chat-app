import React from "react";
import { ChatMessage } from "@org/api-contract";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { cn } from "@/lib/cn";
import { MessageStatusIcon } from "./message-status-icon";
import { useSenderSession } from "@/lib/use-sender-session";

type MessageBubbleProps = {
  message: ChatMessage;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const as = useSenderSession((store) => store.as);
  const sentBy: "current-user" | "other-user" = message.as === as ? "current-user" : "other-user";

  return (
    <div className={cn("flex pb-2", sentBy === "current-user" ? "justify-end" : "justify-start")}>
      <div className="flex items-center gap-2">
        {sentBy === "other-user" && (
          <Avatar>
            <AvatarFallback className="uppercase">{message.as.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "text-sm p-2 rounded-lg flex items-end gap-1",
            sentBy === "current-user" ? "bg-blue-600 text-white" : "bg-muted text-white",
          )}
        >
          <p>{message.content}</p>

          {sentBy === "current-user" && <MessageStatusIcon message={message} />}
        </div>
      </div>
    </div>
  );
};
