import React, { useEffect, useState, ReactNode } from "react";
import { WsContext, WsContextType } from "./useWsConnection";

interface WsProviderProps {
  children: ReactNode;
}

export function WsProvider({ children }: WsProviderProps) {
  const [context, setContext] = useState<WsContextType>({
    socket: null,
    isConnected: false,
  });

  const reconnectTimeouts = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = React.useRef<number>(0);
  const connectFnRef = React.useRef<() => void>(() => {});

  useEffect(() => {
    const connect = () => {
      if (context.socket?.readyState === WebSocket.OPEN) {
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.host;
      const url = `${protocol}://${host}/ws`;

      try {
        const socket = new WebSocket(url);

        socket.onopen = () => {
          setContext({ socket, isConnected: true });
          reconnectAttempts.current = 0;
          if (reconnectTimeouts.current) {
            clearTimeout(reconnectTimeouts.current);
            reconnectTimeouts.current = null;
          }
        };

        socket.onclose = () => {
          setContext({ socket: null, isConnected: false });
          scheduleReconnect();
        };

        socket.onerror = () => {
          setContext({ socket: null, isConnected: false });
          scheduleReconnect();
        };
      } catch (error) {
        console.error("Failed to create WebSocket:", error);
        scheduleReconnect();
      }
    };

    const scheduleReconnect = () => {
      if (reconnectTimeouts.current) {
        clearTimeout(reconnectTimeouts.current);
      }

      const baseDelay = 1000;
      const maxDelay = 30000;
      const delay = Math.min(baseDelay * Math.pow(2, reconnectAttempts.current), maxDelay);
      reconnectAttempts.current += 1;

      reconnectTimeouts.current = setTimeout(() => {
        connect();
      }, delay);
    };

    connectFnRef.current = connect;
    connect();

    return () => {
      if (reconnectTimeouts.current) {
        clearTimeout(reconnectTimeouts.current);
      }
      if (context.socket) {
        context.socket.close();
      }
    };
  }, [context.socket]);

  return <WsContext.Provider value={context}>{children}</WsContext.Provider>;
}
