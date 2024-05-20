import { ScrollArea } from "@/components/scroll-area";
import React from "react";
import { MessageBubble } from "./message-bubble";
import { type ChatMessage } from "@org/api-contract";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useHandleIsAtBottom } from "./lib/hooks/use-is-at-bottom";
import { Button } from "@/components/button";
import { useMessagesQuery } from "@/lib/data-access/use-messages-query";

export const MessageList: React.FC = () => {
  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const [scrollParent, setScrollParent] = React.useState<HTMLDivElement | undefined>();
  const { followOutput } = useHandleIsAtBottom({ scrollParent });

  const query = useMessagesQuery();
  const messages = query.data ?? [];

  const Row = React.useMemo(
    () => (i: number, message: ChatMessage) => {
      return <MessageBubble key={i} message={message} />;
    },
    [],
  );

  return (
    <React.Fragment>
      {query.isError && (
        <div className="flex flex-1 items-center flex-col justify-center h-20 text-red-500">
          <p>Oh no, something went wrong: {query.error.message}</p>

          <Button
            onClick={() => {
              void query.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {query.isLoading && <div className="flex flex-1 items-center justify-center h-20">Loading...</div>}

      {query.isSuccess && (
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
      )}
    </React.Fragment>
  );
};
