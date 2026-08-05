import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { StorageModule } from "./modules/storage/storage.module";
import { AuthModule } from "./modules/auth/auth.module";
import { YearLevelsModule } from "./modules/year-levels/year-levels.module";
import { SubjectsModule } from "./modules/subjects/subjects.module";
import { ExamTypesModule } from "./modules/exam-types/exam-types.module";
import { PapersModule } from "./modules/papers/papers.module";
import { NotesModule } from "./modules/notes/notes.module";
import { StudyRoomsModule } from "./modules/study-rooms/study-rooms.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    YearLevelsModule,
    SubjectsModule,
    ExamTypesModule,
    PapersModule,
    NotesModule,
    StudyRoomsModule,
  ],
  controllers: [AppController],
  providers: [
    // Order matters: JwtAuthGuard populates request.user before RolesGuard
    // checks it. Both are global so every new route is protected by default
    // (opt out with @Public(), opt into admin-only with @Roles(admin)).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
