import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { zValidator } from "@hono/zod-validator";
import { chatMessageSchema } from "@org/api-contract";
import { cors } from "hono/cors";
import { WsEvents } from "./types";
import { Duration, Effect, Random, pipe } from "effect";
import { ChatMessagesService } from "./services/chat-messages.service";
import { EndpointRuntime } from "./runtimes/endpoint.runtime";
import { WebSocketBroadcastService } from "./services/websocket.service";
import { z } from "zod";

const app = new Hono();
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH"],
    allowHeaders: ["Content-Type"],
  }),
);

const { upgradeWebSocket, websocket } = createBunWebSocket();

const router = app
  .get("/chat", (c) => {
    return pipe(
      Effect.gen(function* () {
        const chatMessagesService = yield* ChatMessagesService;
        const allMessages = yield* chatMessagesService.getAll.pipe(
          Effect.tap((messages) => Effect.log(`Got ${messages.length} messages`)),
        );

        const sleepFor = yield* Random.nextRange(0.5, 1.5);
        yield* Effect.sleep(Duration.seconds(sleepFor)).pipe(
          Effect.tap(() => Effect.log(`Sleeping for ${sleepFor} seconds`)),
        );

        yield* Effect.log(`Responding to client`);
        return c.json(allMessages);
      }),
      Effect.annotateLogs({ endpoint: "/chat", method: "GET" }),
      EndpointRuntime.runPromise,
    );
  })
  .post("/chat", zValidator("json", chatMessageSchema.omit({ id: true })), async (c) => {
    return pipe(
      Effect.gen(function* () {
        const chatMessagesService = yield* ChatMessagesService;
        const wsService = yield* WebSocketBroadcastService;

        const incomingMessage = c.req.valid("json");
        const newMessage = yield* chatMessagesService
          .add(incomingMessage)
          .pipe(Effect.tap((message) => Effect.log(`Added message with id ${message.id}`)));

        yield* wsService.broadcast({ type: "new-message", message: newMessage });

        return c.json(newMessage);
      }),
      Effect.annotateLogs({ endpoint: "/chat", method: "POST" }),
      EndpointRuntime.runPromise,
    );
  })
  .patch(
    "/chat/mark-as-read",
    zValidator("json", z.array(chatMessageSchema.pick({ id: true, readAt: true })).max(50)),
    (c) => {
      return pipe(
        Effect.gen(function* () {
          const chatMessagesService = yield* ChatMessagesService;
          const wsService = yield* WebSocketBroadcastService;

          const messages = c.req.valid("json");
          for (const message of messages) {
            yield* chatMessagesService.markAsRead(message.id, message.readAt);
          }

          yield* wsService.broadcast({ type: "read-messages", messages });

          return c.json(messages);
        }),
        Effect.annotateLogs({ endpoint: "/chat/mark-as-read", method: "PATCH" }),
        EndpointRuntime.runPromise,
      );
    },
  )
  .get(
    "/ws",
    upgradeWebSocket(() => {
      return {
        onOpen(_event, ws) {
          EndpointRuntime.runSync(
            Effect.flatMap(WebSocketBroadcastService, (wsService) => wsService.addConnection(ws)),
          );
        },
        onClose: (_event, ws) => {
          EndpointRuntime.runSync(
            Effect.flatMap(WebSocketBroadcastService, (wsService) => wsService.removeConnection(ws)),
          );
        },
      };
    }),
  );

export default {
  fetch: app.fetch,
  websocket,
  port: 3000,
};

export type Api = typeof router;
export { type WsEvents };
