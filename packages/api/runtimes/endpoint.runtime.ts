import { Layer, ManagedRuntime } from "effect";
import { ChatMessagesServiceLive } from "../services/chat-messages.service";
import { WebSocketBroadcastServiceLive } from "../services/websocket.service";

export const EndpointRuntime = ManagedRuntime.make(
  Layer.mergeAll(ChatMessagesServiceLive, WebSocketBroadcastServiceLive),
);
