import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StoredFileUrlService } from "./stored-file-url.service";

@Global()
@Module({
  providers: [StorageService, StoredFileUrlService],
  exports: [StorageService, StoredFileUrlService],
})
export class StorageModule {}
