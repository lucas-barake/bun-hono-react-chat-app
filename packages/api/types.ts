import { ChatMessage } from "packages/api-contract";

type NewMessageEvent = {
  type: "new-message";
  message: ChatMessage;
};

type ReadMessageEvent = {
  type: "read-message";
  message: ChatMessage;
};

export type WsEvents = NewMessageEvent | ReadMessageEvent;
