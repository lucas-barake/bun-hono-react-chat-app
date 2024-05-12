import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { zValidator } from "@hono/zod-validator";
import { ChatMessage, chatMessageSchema } from "@org/api-contract";
import { createId } from "@paralleldrive/cuid2";
import { messages } from "./mock-data";
import { cors } from "hono/cors";
import { WSContext } from "hono/ws";
import { WsEvents } from "./types";
import { Duration, Effect } from "effect";

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
  .get("/chat", (c) => c.json(messages))
  .post("/chat", zValidator("json", chatMessageSchema.omit({ id: true })), async (c) => {
    return Effect.gen(function* () {
      yield* Effect.sleep(Duration.seconds(2));

      const newMessage = c.req.valid("json");
      const message = { ...newMessage, id: createId() } satisfies ChatMessage;
      messages.push(message);

      broadcastMessage({ type: "new-message", message });

      return c.json(newMessage);
    }).pipe(Effect.runPromise);
  })
  .patch("/chat/read", zValidator("json", chatMessageSchema.pick({ id: true, readAt: true })), (c) => {
    const { id, readAt } = c.req.valid("json");
    const message = messages.find((m) => m.id === id);
    if (message === undefined) {
      return c.notFound();
    }
    message.readAt = readAt;
    broadcastMessage({ type: "read-message", message });
    return c.json(message);
  })
  .get(
    "/ws",
    upgradeWebSocket(() => {
      return {
        onOpen(_event, ws) {
          activeConnections.add(ws);
        },
        onClose: () => {
          console.log("Connection closed");
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
