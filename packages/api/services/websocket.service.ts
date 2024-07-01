import { Context, Effect, HashSet, Layer } from "effect";
import { WSContext } from "hono/ws";
import { WsEvents } from "../types";

class WebSocketBroadcastServiceImpl {
  private connections = HashSet.empty<WSContext>();

  addConnection = (connection: WSContext) =>
    Effect.sync(() => {
      this.connections = HashSet.add(this.connections, connection);
    }).pipe(Effect.tap(() => Effect.log("Connection added")));

  removeConnection = (connection: WSContext) =>
    Effect.sync(() => {
      this.connections = HashSet.remove(this.connections, connection);
    }).pipe(Effect.tap(() => Effect.log("Connection removed")));

  broadcast = (event: WsEvents) =>
    Effect.forEach(
      this.connections,
      (connection, index) =>
        Effect.try(() => connection.send(JSON.stringify(event))).pipe(
          Effect.tap(() => Effect.log(`Singular event broadcasted to connection ${index}`)),
        ),
      {
        discard: true,
      },
    ).pipe(
      Effect.tap(() => Effect.log("Event broadcasted")),
      Effect.annotateLogs({ eventType: event.type }),
    );
}

export class WebSocketBroadcastService extends Context.Tag("WebSocketBroadcastService")<
  WebSocketBroadcastService,
  WebSocketBroadcastServiceImpl
>() {}

export const WebSocketBroadcastServiceLive = Layer.succeed(
  WebSocketBroadcastService,
  new WebSocketBroadcastServiceImpl(),
);
