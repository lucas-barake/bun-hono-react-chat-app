import { ChatMessage } from "packages/api-contract";

type NewMessageEvent = {
  type: "new-message";
  message: ChatMessage;
};

type ReadMessagesEvent = {
  type: "read-messages";
  messages: Array<Pick<ChatMessage, "id" | "readAt">>;
};

export type WsEvents = NewMessageEvent | ReadMessagesEvent;
