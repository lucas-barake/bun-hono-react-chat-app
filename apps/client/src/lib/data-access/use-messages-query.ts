import { useQuery } from "@tanstack/react-query";
import { client } from "../client";
import { ChatMessage } from "@org/api-contract";

export type UseMessagesQueryFnResult = ChatMessage[];
function queryFn(): Promise<UseMessagesQueryFnResult> {
  return client.chat.$get().then((res) => res.json());
}

export type UseMessagesQueryKey = ["chat"];

export function useMessagesQuery() {
  return useQuery({
    queryKey: ["chat"] satisfies UseMessagesQueryKey,
    queryFn,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  });
}
