import { createSlice } from "@reduxjs/toolkit";
import type { Socket } from "socket.io-client";

import { socketConnect } from "@/utils/socket/SocketConnection";

/**
 * Legacy compatibility export.
 * All historical `import { socket } from SocketSlice` callers must share the
 * single Socket.IO client owned by `socketConnect` — never open a second `io()`.
 */
function getLiveSocket(): Socket | null {
  return socketConnect.getSocket();
}

export const socket = new Proxy({} as Socket, {
  get(_target, prop, _receiver) {
    if (prop === "emit") {
      return (event: string, ...args: any[]) => {
        const live = getLiveSocket();
        if (live?.connected) {
          return (live.emit as any)(event, ...args);
        }
        // Ensure connection then emit (fire-and-forget for legacy sync callers)
        void socketConnect.emit(event as any, args[0] as any).catch((err) => {
          console.warn(`[socket bridge] emit failed for ${String(event)}:`, err);
        });
      };
    }

    if (prop === "on") {
      return (event: string, listener: (...args: any[]) => void) => {
        // Prefer SocketConnection messageHandlers for "message" to avoid duplicate work.
        // For other events, attach to the live socket when available.
        const live = getLiveSocket();
        if (!live) {
          console.warn(`[socket bridge] on("${event}") before connect — ignored`);
          return socket;
        }
        live.on(event, listener);
        return socket;
      };
    }

    if (prop === "off") {
      return (event: string, listener?: (...args: any[]) => void) => {
        const live = getLiveSocket();
        if (!live) return socket;
        if (listener) live.off(event, listener);
        else live.off(event);
        return socket;
      };
    }

    if (prop === "disconnect") {
      return () => {
        socketConnect.disconnect();
      };
    }

    if (prop === "connect") {
      return () => {
        void socketConnect.connect();
      };
    }

    if (prop === "connected") {
      return !!getLiveSocket()?.connected;
    }

    if (prop === "id") {
      return getLiveSocket()?.id;
    }

    const live = getLiveSocket() as any;
    const value = live?.[prop as any];
    if (typeof value === "function") {
      return value.bind(live);
    }
    return value;
  },
}) as Socket;

type socketSliceType = {
  socketID: string;
};

const initialState: socketSliceType = {
  socketID: "",
};

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    connectToSocket: (state, { payload }) => {
      // Bridge only — do not create a second io() client.
      void socketConnect.connect().then((live) => {
        if (live?.id) {
          // id synced via updateSocketID from callers if needed
        }
      });
      // Keep payload referenced so older call sites still type-check
      if (payload && typeof payload === "string") {
        // token is read inside socketConnect.connect via getSession()
      }
    },
    disconnectToSocket: (state) => {
      socketConnect.disconnect();
      state.socketID = "";
    },
    reconnectToSocket: (state) => {
      void socketConnect.forceReconnect().then(() => {
        state.socketID = getLiveSocket()?.id || "";
      });
    },
    updateSocketID: (state, { payload }) => {
      state.socketID = payload;
    },
  },
});

export const { connectToSocket, disconnectToSocket, reconnectToSocket, updateSocketID } =
  socketSlice.actions;

export default socketSlice.reducer;
