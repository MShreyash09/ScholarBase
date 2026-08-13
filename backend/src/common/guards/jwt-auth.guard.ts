import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { IS_OPTIONAL_AUTH_KEY } from "../decorators/optional-auth.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  private isOptional(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_AUTH_KEY, [
        context.getHandler(),
        context.getClass(),
      ]),
    );
  }

  canActivate(context: ExecutionContext) {
    // Optional wins over public: the route still needs passport to run so that
    // request.user is populated when a token *was* supplied.
    if (this.isOptional(context)) {
      return super.canActivate(context);
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Passport calls this with whatever the strategy produced. The base
   * implementation throws when there is no user; on an optional route a missing
   * or invalid token simply means "anonymous", so the request continues with
   * request.user left undefined.
   */
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    if (this.isOptional(context)) {
      return (user || undefined) as TUser;
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
