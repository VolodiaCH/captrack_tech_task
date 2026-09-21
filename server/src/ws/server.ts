import { Server as HTTPServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Duplex } from "stream";
import { verifyToken } from "../auth/jwt.js";
import { getTokenFromCookie } from "../auth/cookie.js";
import { AuthedSocket, ConnectionManager } from "./connectionManager.js";
import { handleMessage, handleConnect } from "./handlers.js";

export function setupWebSocketServer(httpServer: HTTPServer): ConnectionManager {
  const wss = new WebSocketServer({ noServer: true });
  const connectionManager = new ConnectionManager();

  httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    if (request.url !== "/ws") {
      socket.destroy();
      return;
    }

    // Extract and verify JWT from cookie
    const token = getTokenFromCookie(request.headers.cookie);
    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    // Upgrade to WebSocket
    wss.handleUpgrade(request, socket as any, head, (ws: WebSocket) => {
      const authedSocket = ws as AuthedSocket;
      authedSocket.userId = payload.userId;
      authedSocket.isAlive = true;

      connectionManager.addConnection(authedSocket.userId, authedSocket);

      handleConnect(authedSocket, connectionManager).catch(console.error);

      authedSocket.on("message", (data: Buffer) => {
        handleMessage(authedSocket, connectionManager, data.toString()).catch(console.error);
      });

      authedSocket.on("pong", () => {
        authedSocket.isAlive = true;
      });

      authedSocket.on("close", () => {
        connectionManager.removeConnection(authedSocket.userId, authedSocket);
      });

      authedSocket.on("error", (err) => {
        console.error("WebSocket error:", err);
      });
    });
  });

  // Heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        ws.terminate();
        return;
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });

  return connectionManager;
}
