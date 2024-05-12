import { ChatMessage } from "@org/api-contract";
import { create } from "zustand";

type Session = {
  as: ChatMessage["as"];
};

export const useSenderSession = create<Session>(() => ({
  as: "john",
}));
