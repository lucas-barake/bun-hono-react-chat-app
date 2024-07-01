import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { zValidator } from "@hono/zod-validator";
import { chatMessageSchema } from "@org/api-contract";
import { cors } from "hono/cors";
import { WSContext } from "hono/ws";
import { WsEvents } from "./types";
import { Duration, Effect, Option, Random } from "effect";
import { ChatMessagesService } from "./services/chat-messages.service";
import { EndpointRuntime } from "./runtimes/endpoint.runtime";
import { WebSocketBroadcastService } from "./services/websocket.service";

const app = new Hono();
app.use(
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PATCH"],
    allowHeaders: ["Content-Type"],
  }),
);

const { upgradeWebSocket, websocket } = createBunWebSocket();
const activeConnections = new Set<WSContext>();

function broadcastMessage(event: WsEvents) {
  for (const ws of activeConnections) {
    ws.send(JSON.stringify(event));
  }
}

const router = app
  .get("/chat", (c) => {
    return Effect.gen(function* () {
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
    }).pipe(Effect.annotateLogs({ endpoint: "getting all messages" }), EndpointRuntime.runPromise);
  })
  .post("/chat", zValidator("json", chatMessageSchema.omit({ id: true })), async (c) => {
    return Effect.gen(function* () {
      const chatMessagesService = yield* ChatMessagesService;
      const wsService = yield* WebSocketBroadcastService;

      const incomingMessage = c.req.valid("json");
      const newMessage = yield* chatMessagesService
        .add(incomingMessage)
        .pipe(Effect.tap((message) => Effect.log(`Added message with id ${message.id}`)));

      yield* wsService.broadcast({ type: "new-message", message: newMessage });

      return c.json(newMessage);
    }).pipe(Effect.annotateLogs({ endpoint: "adding a message" }), EndpointRuntime.runPromise);
  })
  .patch("/chat/read", zValidator("json", chatMessageSchema.pick({ id: true, readAt: true })), (c) => {
    return Effect.gen(function* () {
      const chatMessagesService = yield* ChatMessagesService;
      const wsService = yield* WebSocketBroadcastService;

      const { id, readAt } = c.req.valid("json");
      const message = yield* chatMessagesService.markAsRead(id, readAt);
      if (Option.isNone(message)) {
        const notFound = c.notFound();
        if (notFound instanceof Promise) return yield* Effect.promise(() => notFound);
        return notFound;
      }

      yield* wsService.broadcast({ type: "read-message", message: message.value });

      return c.json(message.value);
    }).pipe(EndpointRuntime.runPromise);
  })
  .get(
    "/ws",
    upgradeWebSocket(() => {
      return {
        onOpen(_event, ws) {
          EndpointRuntime.runSync(
            Effect.andThen(WebSocketBroadcastService, (wsService) => wsService.addConnection(ws)),
          );
        },
        onClose: (_event, ws) => {
          EndpointRuntime.runSync(
            Effect.andThen(WebSocketBroadcastService, (wsService) => wsService.removeConnection(ws)),
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
