import { WebSocket } from "ws";
import { ServerMessage } from "./messages.js";

export interface AuthedSocket extends WebSocket {
  userId: string;
  subscribedMonth?: string;
  isAlive?: boolean;
}

export class ConnectionManager {
  private userConnections = new Map<string, Set<AuthedSocket>>();

  addConnection(userId: string, socket: AuthedSocket): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(socket);
  }

  removeConnection(userId: string, socket: AuthedSocket): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(socket);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  broadcast(userId: string, message: ServerMessage, filter?: (socket: AuthedSocket) => boolean): void {
    const connections = this.userConnections.get(userId);
    if (!connections) return;

    const payload = JSON.stringify(message);
    for (const socket of connections) {
      if (socket.readyState === 1 && (!filter || filter(socket))) {
        socket.send(payload);
      }
    }
  }

  broadcastToSubscribed(userId: string, yearMonth: string, message: ServerMessage): void {
    this.broadcast(userId, message, (socket) => socket.subscribedMonth === yearMonth);
  }
}
