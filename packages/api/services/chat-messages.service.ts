import { ChatMessage } from "@org/api-contract";
import { Context, Effect, Layer, Option, Ref } from "effect";
import { createId } from "@paralleldrive/cuid2";

class ChatMessagesRef {
  public getAll: Effect.Effect<ChatMessage[], never, never>;
  public markAsRead: (
    messageId: ChatMessage["id"],
    readAt: ChatMessage["readAt"],
  ) => Effect.Effect<Option.Option<ChatMessage>, never, never>;
  public add: (message: Omit<ChatMessage, "id">) => Effect.Effect<ChatMessage, never, never>;

  constructor(private ref: Ref.Ref<ChatMessage[]>) {
    this.getAll = Ref.get(this.ref);

    this.markAsRead = (messageId, readAt) =>
      Ref.updateAndGet(ref, (messages) =>
        messages.map((message) => (message.id === messageId ? { ...message, readAt } : message)),
      ).pipe(Effect.map((messages) => Option.fromNullable(messages.find((message) => message.id === messageId))));

    this.add = (message) =>
      Effect.gen(function* () {
        const newMessage = { ...message, id: createId() } satisfies ChatMessage;
        yield* Ref.update(ref, (messages) => [...messages, newMessage]);

        return newMessage;
      });
  }

  static make(initialMessages: ChatMessage[] = []): Effect.Effect<ChatMessagesRef, never, never> {
    return Effect.gen(function* (_) {
      const ref = yield* Ref.make(initialMessages);
      return new ChatMessagesRef(ref);
    });
  }
}

export class ChatMessagesService extends Context.Tag("ChatMessagesService")<ChatMessagesService, ChatMessagesRef>() {}

export const messages: ChatMessage[] = [];

export const ChatMessagesServiceLive = Layer.effect(ChatMessagesService, ChatMessagesRef.make(messages));
