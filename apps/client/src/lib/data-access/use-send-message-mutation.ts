import { useMutation } from "@tanstack/react-query";
import { useSenderSession } from "../use-sender-session";
import { ChatMessage } from "@org/api-contract";
import { client, queryClient } from "../client";
import { UseMessagesQueryFnResult, UseMessagesQueryKey } from "./use-messages-query";
import { create } from "mutative";

export function useSendMessageMutation() {
  return useMutation({
    mutationKey: ["send-message"],
    mutationFn(variables: { message: string }) {
      return client.chat.$post({
        json: {
          as: useSenderSession.getState().as,
          content: variables.message,
          createdAt: new Date().toISOString(),
        },
      });
    },

    onMutate(variables) {
      const optimisticMessage = {
        id: `optimistic-${Math.random()}`,
        as: useSenderSession.getState().as,
        content: variables.message,
        createdAt: new Date().toISOString(),
      } satisfies ChatMessage;

      queryClient.setQueryData<ChatMessage[]>(["chat"], (cachedData) => {
        if (cachedData === undefined) return [optimisticMessage];
        return create(cachedData, (draft) => {
          draft.push(optimisticMessage);
        });
      });

      return { optimisticMessage };
    },

    async onSuccess(newMessageResponse, _variables, { optimisticMessage }) {
      const newMessage = await newMessageResponse.json();

      const messagesQueryKey = ["chat"] satisfies UseMessagesQueryKey;
      queryClient.setQueryData<UseMessagesQueryFnResult>(messagesQueryKey, (cachedData) => {
        if (cachedData === undefined || cachedData === null) return [newMessage];
        return create(cachedData, (draft) => {
          const optimisticMessageIndex = draft.findIndex((message) => message.id === optimisticMessage.id);
          draft[optimisticMessageIndex] = newMessage;
        });
      });
    },

    onError(_error, _variables, context) {
      if (context === undefined) return;

      const messagesQueryKey = ["chat"] satisfies UseMessagesQueryKey;
      queryClient.setQueryData<UseMessagesQueryFnResult>(messagesQueryKey, (cachedData) => {
        if (cachedData === undefined || cachedData === null) return [];
        return create(cachedData, (draft) => {
          const optimisticMessageIndex = draft.findIndex((message) => message.id === context.optimisticMessage.id);
          draft.splice(optimisticMessageIndex, 1);
        });
      });
    },
  });
}
