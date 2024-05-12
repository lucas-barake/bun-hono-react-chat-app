import React from "react";
import { ChatMessage } from "@org/api-contract";
import { Avatar, AvatarFallback } from "@/components/avatar";
import { cn } from "@/lib/cn";
import { P, match } from "ts-pattern";
import { CheckCheckIcon, CheckIcon, ClockIcon } from "lucide-react";

const MessageStatusIcon: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return match(message)
    .returnType<React.JSX.Element>()
    .with(
      {
        id: P.string.startsWith("optimistic"),
      },
      () => <ClockIcon className="size-3" />
    )
    .with(
      {
        readAt: P.nonNullable,
      },
      () => <CheckCheckIcon className="size-3" />
    )
    .otherwise(() => <CheckIcon className="size-3" />);
};

type MessageBubbleProps = {
  message: ChatMessage;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={cn("flex", message.as === "john" ? "justify-start" : "justify-end")}>
      <div className="flex items-center gap-2">
        {message.as !== "melissa" && (
          <Avatar>
            <AvatarFallback className="uppercase">{message.as.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            "text-sm p-2 rounded-lg flex items-end gap-1",
            message.as === "john" ? "bg-muted text-white" : "bg-blue-600 text-white"
          )}>
          <p>{message.content}</p>

          <MessageStatusIcon message={message} />
        </div>
      </div>
    </div>
  );
};
