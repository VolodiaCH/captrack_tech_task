import { createContext, useContext } from "react";

export interface WsContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

export const WsContext = createContext<WsContextType | undefined>(undefined);

export function useWsConnection(): WsContextType {
  const context = useContext(WsContext);
  if (!context) {
    throw new Error("useWsConnection must be used within WsProvider");
  }
  return context;
}
