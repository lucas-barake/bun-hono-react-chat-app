import type { WsEvents, Api } from "@org/api";
import { hc } from "hono/client";
import { QueryClient } from "@tanstack/react-query";

export const client = hc<Api>("http://localhost:3000");
export const ws = client.ws.$ws(0);

ws.addEventListener("message", (event) => {
  const eventData: WsEvents = JSON.parse(event.data);
  console.log(eventData);
});

export const queryClient = new QueryClient();
