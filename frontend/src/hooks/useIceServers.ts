import { useCallback, useRef } from "react";
import type { IceConfigDto } from "@scholarbase/shared-types";
import { apiClient } from "@/lib/api-client";

/**
 * Fetches the ICE configuration from the backend, which is the only place TURN
 * credentials can come from: they are minted with an expiry, so a build-time
 * `VITE_` variable cannot hold them.
 *
 * `VITE_ICE_SERVERS` is still honoured as a local-development override, but it
 * is no longer the primary path and there is no hard-coded public TURN server
 * left in the bundle — the previous default pointed at a free relay whose
 * anonymous credentials no longer authenticate, so every cross-network call
 * fell back to STUN-only and quietly never connected.
 */

const STUN_ONLY_FALLBACK: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

export interface IceConfig {
  iceServers: RTCIceServer[];
  turnConfigured: boolean;
}

function fromEnvOverride(): IceConfig | null {
  const raw = import.meta.env.VITE_ICE_SERVERS;
  if (!raw) return null;
  try {
    const iceServers = JSON.parse(raw) as RTCIceServer[];
    const turnConfigured = iceServers.some((server) =>
      ([] as string[])
        .concat(server.urls as string | string[])
        .some((url) => url.startsWith("turn:") || url.startsWith("turns:")),
    );
    return { iceServers, turnConfigured };
  } catch {
    console.warn("VITE_ICE_SERVERS is not valid JSON; ignoring it");
    return null;
  }
}

export interface UseIceServersResult {
  /** Cached; refetches only once the credentials are close to expiring. */
  load: () => Promise<IceConfig>;
  /** Whatever was loaded last, for synchronous reads inside peer setup. */
  current: () => IceConfig;
}

export function useIceServers(): UseIceServersResult {
  const cacheRef = useRef<{ config: IceConfig; expiresAt: number } | null>(null);
  const inflightRef = useRef<Promise<IceConfig> | null>(null);

  const load = useCallback(async (): Promise<IceConfig> => {
    const override = fromEnvOverride();
    if (override) return override;

    const cached = cacheRef.current;
    if (cached && Date.now() < cached.expiresAt) return cached.config;
    if (inflightRef.current) return inflightRef.current;

    const request = apiClient
      .get<IceConfigDto>("/study-rooms/ice-servers")
      .then(({ data }) => {
        const config: IceConfig = {
          iceServers: data.iceServers as RTCIceServer[],
          turnConfigured: data.turnConfigured,
        };
        // Refresh at 80% of the advertised lifetime so a long call never tries
        // an ICE restart with credentials that expired mid-session.
        cacheRef.current = {
          config,
          expiresAt: Date.now() + data.ttlSeconds * 1000 * 0.8,
        };
        return config;
      })
      .catch(() => {
        // A failed fetch must not block the call outright — same-network peers
        // still connect on STUN, and the client reports the limitation if they
        // turn out not to.
        console.warn("Could not load ICE servers; falling back to STUN only");
        return { iceServers: STUN_ONLY_FALLBACK, turnConfigured: false };
      })
      .finally(() => {
        inflightRef.current = null;
      });

    inflightRef.current = request;
    return request;
  }, []);

  const current = useCallback(
    (): IceConfig =>
      fromEnvOverride() ??
      cacheRef.current?.config ?? { iceServers: STUN_ONLY_FALLBACK, turnConfigured: false },
    [],
  );

  return { load, current };
}
