import { createContext, useContext } from "react";
export const WsContext = createContext(undefined);
export function useWsConnection() {
    const context = useContext(WsContext);
    if (!context) {
        throw new Error("useWsConnection must be used within WsProvider");
    }
    return context;
}
