import { SetMetadata } from "@nestjs/common";

export const IS_OPTIONAL_AUTH_KEY = "isOptionalAuth";

/**
 * Authenticate if a token is present, but let anonymous callers through.
 *
 * `@Public()` skips the guard entirely, so `request.user` is always undefined
 * even when the caller sent a perfectly good token. That is fine for endpoints
 * with one behaviour for everyone, but useless for a route that must serve
 * anonymous *and* logged-in users differently — such as question papers, where
 * a signed-out visitor gets one free preview per semester and a student gets
 * the lot.
 */
export const OptionalAuth = () => SetMetadata(IS_OPTIONAL_AUTH_KEY, true);
