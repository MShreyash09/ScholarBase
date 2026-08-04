import { io, type Socket } from "socket.io-client";
import { STUDY_ROOM_NAMESPACE } from "@scholarbase/shared-types";
import { authStorage } from "./auth-storage";

const apiOrigin = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/**
 * The gateway authenticates the handshake, so the access token is read fresh
 * on every connection attempt — a reconnect after a token refresh then picks
 * up the new token instead of retrying with the stale one.
 */
export function createStudyRoomSocket(): Socket {
  return io(`${apiOrigin}${STUDY_ROOM_NAMESPACE}`, {
    transports: ["websocket"],
    autoConnect: false,
    auth: (cb) => cb({ token: authStorage.getAccessToken() ?? "" }),
  });
}
