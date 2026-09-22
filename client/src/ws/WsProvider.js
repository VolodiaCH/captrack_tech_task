import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState, useCallback } from "react";
import { WsContext } from "./useWsConnection";
export function WsProvider({ children }) {
    const [context, setContext] = useState({
        socket: null,
        isConnected: false,
    });
    const reconnectTimeouts = React.useRef(null);
    const connect = useCallback(() => {
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
        }
        catch (error) {
            console.error("Failed to create WebSocket:", error);
            scheduleReconnect();
        }
    }, [context.socket]);
    const scheduleReconnect = useCallback(() => {
        if (reconnectTimeouts.current) {
            clearTimeout(reconnectTimeouts.current);
        }
        const delays = [1000, 2000, 4000, 8000, 16000, 30000];
        const delay = delays[Math.min(delays.length - 1, Math.floor(Math.random() * 3))];
        reconnectTimeouts.current = setTimeout(() => {
            connect();
        }, delay);
    }, [connect]);
    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeouts.current) {
                clearTimeout(reconnectTimeouts.current);
            }
            if (context.socket) {
                context.socket.close();
            }
        };
    }, []);
    return _jsx(WsContext.Provider, { value: context, children: children });
}
