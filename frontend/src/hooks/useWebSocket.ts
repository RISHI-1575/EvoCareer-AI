import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "../store/authStore";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const { accessToken } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!accessToken) return;
    const socket = new WebSocket(`${WS_URL}/ws/career?token=${accessToken}`);
    socket.onopen = () => setConnected(true);
    socket.onmessage = (e) => { try { setLastMessage(JSON.parse(e.data)); } catch {} };
    socket.onclose = () => setConnected(false);
    ws.current = socket;
    return () => socket.close();
  }, [accessToken]);

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, lastMessage, send };
}