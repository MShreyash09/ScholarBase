import { createHmac } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { IceConfigDto, IceServerDto } from "@scholarbase/shared-types";

/**
 * Builds the ICE configuration the browser uses for study-room calls.
 *
 * Why this is a server endpoint and not a frontend env var:
 *
 * 1. Two students on different home broadband lines are usually both behind
 *    carrier-grade NAT. CGNAT is frequently *symmetric*, and a symmetric NAT
 *    rewrites the source port per destination — so the address STUN reports is
 *    useless to anyone else, no candidate pair ever validates, and the call
 *    silently never connects. The only fix is a TURN relay. TURN is therefore
 *    not a nice-to-have for "campus wifi"; it is what makes cross-ISP calls
 *    work at all.
 * 2. A usable TURN server authenticates. The standard scheme (coturn's
 *    `--use-auth-secret`, RFC 5766 REST auth) mints credentials that expire, so
 *    they must be generated per request — impossible in a static bundle.
 *
 * Configuration (all optional; with none of it set you get STUN only and
 * cross-NAT calls will fail, which the client now says out loud):
 *
 *   STUN_URLS                  comma-separated, defaults to Google's STUN
 *   TURN_URLS                  comma-separated turn:/turns: URLs
 *   TURN_STATIC_AUTH_SECRET    coturn shared secret -> ephemeral credentials
 *   TURN_CREDENTIAL_TTL        seconds those credentials stay valid (default 12h)
 *   TURN_USERNAME/TURN_PASSWORD  long-term credentials, if your provider
 *                              issues fixed ones instead of a shared secret
 */
@Injectable()
export class IceServersService {
  private readonly logger = new Logger(IceServersService.name);

  private static readonly DEFAULT_STUN = [
    "stun:stun.l.google.com:19302",
    "stun:stun1.l.google.com:19302",
  ];

  private static readonly DEFAULT_TTL_SECONDS = 12 * 60 * 60;

  private warnedAboutMissingTurn = false;

  constructor(private readonly config: ConfigService) {}

  /**
   * @param userId Folded into the ephemeral TURN username so relay usage is
   *   attributable to an account — the thing that makes abuse of a metered
   *   relay traceable instead of anonymous.
   */
  getIceConfig(userId: string): IceConfigDto {
    const stunUrls = this.list("STUN_URLS", IceServersService.DEFAULT_STUN);
    const turnUrls = this.list("TURN_URLS", []);

    const iceServers: IceServerDto[] = [];
    if (stunUrls.length > 0) iceServers.push({ urls: stunUrls });

    const ttlSeconds = Number(
      this.config.get<string>("TURN_CREDENTIAL_TTL") ?? IceServersService.DEFAULT_TTL_SECONDS,
    );

    if (turnUrls.length === 0) {
      // Logged once, not per request: a room full of students would otherwise
      // bury every other line in the log.
      if (!this.warnedAboutMissingTurn) {
        this.warnedAboutMissingTurn = true;
        this.logger.warn(
          "No TURN_URLS configured. Study-room calls will only connect between " +
            "peers that can reach each other directly — participants on different " +
            "home/mobile networks (CGNAT) will fail to connect.",
        );
      }
      return { iceServers, ttlSeconds, turnConfigured: false };
    }

    const credentials = this.turnCredentials(userId, ttlSeconds);
    if (!credentials) {
      this.logger.error(
        "TURN_URLS is set but no credentials are configured. Set either " +
          "TURN_STATIC_AUTH_SECRET or TURN_USERNAME + TURN_PASSWORD.",
      );
      return { iceServers, ttlSeconds, turnConfigured: false };
    }

    // One entry holding every TURN URL, not one entry per URL: the browser
    // gathers a candidate per (server, transport) pair either way, but a single
    // entry keeps the credential identical across them, which some TURN servers
    // require when the same allocation is retried over TCP after UDP is blocked.
    iceServers.push({ urls: turnUrls, ...credentials });

    return { iceServers, ttlSeconds, turnConfigured: true };
  }

  /**
   * coturn's REST scheme: the username is `<unix expiry>:<id>` and the password
   * is the base64 HMAC-SHA1 of that username under the shared secret. The
   * server recomputes it, so no credential is ever stored anywhere.
   */
  private turnCredentials(
    userId: string,
    ttlSeconds: number,
  ): { username: string; credential: string } | null {
    const secret = this.config.get<string>("TURN_STATIC_AUTH_SECRET");
    if (secret) {
      const username = `${Math.floor(Date.now() / 1000) + ttlSeconds}:${userId}`;
      const credential = createHmac("sha1", secret).update(username).digest("base64");
      return { username, credential };
    }

    const username = this.config.get<string>("TURN_USERNAME");
    const password = this.config.get<string>("TURN_PASSWORD");
    if (username && password) return { username, credential: password };

    return null;
  }

  private list(key: string, fallback: string[]): string[] {
    const raw = this.config.get<string>(key);
    if (raw === undefined) return fallback;
    const parsed = raw
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    // An explicitly empty value is a deliberate "none", not a request for the
    // defaults — that is how you turn STUN off to test relay-only paths.
    return parsed;
  }
}
