import type { WsEvents, Api } from "@org/api";
import { hc } from "hono/client";
import { QueryClient } from "@tanstack/react-query";
import { UseMessagesQueryFnResult, UseMessagesQueryKey } from "./data-access/use-messages-query";
import { create } from "mutative";

export const client = hc<Api>("http://localhost:3000");
export const ws = client.ws.$ws(0);

ws.addEventListener("message", (event) => {
  const eventData: WsEvents = JSON.parse(event.data);

  switch (eventData.type) {
    case "new-message": {
      const messagesQueryKey = ["chat"] satisfies UseMessagesQueryKey;
      queryClient.setQueryData<UseMessagesQueryFnResult>(messagesQueryKey, (cachedData) => {
        if (cachedData === null || cachedData === undefined) return cachedData;

        const messageExists = cachedData.find((message) => message.id === eventData.message.id);
        if (messageExists) return undefined; // undefined -> signals tanstack query to leave the cached data untouched

        return create(cachedData, (draft) => {
          draft.push(eventData.message);
        });
      });
      break;
    }

    // TODO: Implement use-mark-message-as-read.ts
    case "read-message":
      break;
  }
});

export const queryClient = new QueryClient();
