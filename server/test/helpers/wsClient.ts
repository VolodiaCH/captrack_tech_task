import { WebSocket } from "ws";

export async function connectWebSocket(url: string, cookie: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: {
        Cookie: cookie,
      },
    });

    ws.on("open", () => {
      resolve(ws);
    });

    ws.on("error", (err) => {
      reject(err);
    });

    setTimeout(() => {
      reject(new Error("WebSocket connection timeout"));
    }, 5000);
  });
}

export async function waitForMessage<T = any>(ws: WebSocket, timeout = 3000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Message timeout"));
    }, timeout);

    ws.once("message", (data) => {
      clearTimeout(timer);
      try {
        resolve(JSON.parse(data.toString()));
      } catch (err) {
        reject(err);
      }
    });
  });
}

export function send(ws: WebSocket, message: any): void {
  ws.send(JSON.stringify(message));
}
