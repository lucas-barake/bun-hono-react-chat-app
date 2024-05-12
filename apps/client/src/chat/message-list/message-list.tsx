import { ScrollArea } from "@/components/scroll-area";
import React from "react";
import { MessageBubble } from "./message-bubble";
import { type ChatMessage } from "@org/api-contract";
import { client } from "@/lib/client";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useHandleIsAtBottom } from "./lib/hooks/use-is-at-bottom";

export const MessageList: React.FC = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const [scrollParent, setScrollParent] = React.useState<HTMLDivElement | undefined>();
  const { followOutput } = useHandleIsAtBottom({ scrollParent });

  React.useEffect(() => {
    client.chat
      .$get()
      .then((res) => res.json())
      .then(setMessages);
  }, []);

  const Row = React.useMemo(
    () => (i: number, message: ChatMessage) => {
      return <MessageBubble key={i} message={message} />;
    },
    [],
  );

  return (
    <React.Fragment>
      <ScrollArea className="relative flex-1 overflow-y-hidden px-6">
        <ScrollArea.Viewport className="pt-4" ref={(ref) => setScrollParent(ref ?? undefined)}>
          <Virtuoso
            ref={virtuosoRef}
            data={messages}
            initialTopMostItemIndex={messages.length - 1}
            itemContent={Row}
            customScrollParent={scrollParent}
            followOutput={followOutput}
          />
        </ScrollArea.Viewport>
      </ScrollArea>
    </React.Fragment>
  );
};
