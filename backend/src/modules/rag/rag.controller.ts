import { Controller, Post, HttpCode, HttpStatus, Param } from "@nestjs/common";
import { RagService } from "./rag.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { UserRole } from "@scholarbase/shared-types";

@Controller("rag")
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Roles(UserRole.ADMIN)
  @Post("ingest/:id")
  @HttpCode(HttpStatus.ACCEPTED)
  async ingestPaper(@Param("id") id: string): Promise<{ message: string }> {
    // We run it asynchronously so we don't block the HTTP request while the
    // PDF is being parsed and embedded.
    this.ragService.ingestPaper(id).catch((err) => {
      console.error(`Failed to ingest paper ${id}:`, err);
    });
    return { message: "Ingestion started" };
  }
}
