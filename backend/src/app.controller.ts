import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

/**
 * Liveness target for the hosting platform's health check and for an external
 * keep-alive ping (free Web Service hosts sleep after idle). Deliberately does
 * not touch the database — a DB blip shouldn't make the platform think the
 * whole process is down and restart it.
 */
@Controller()
export class AppController {
  @Public()
  @Get("health")
  health(): { status: "ok" } {
    return { status: "ok" };
  }
}
