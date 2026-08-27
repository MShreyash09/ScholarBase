import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { StudyRoomsController } from "./study-rooms.controller";
import { StudyRoomsService } from "./study-rooms.service";
import { StudyRoomsGateway } from "./study-rooms.gateway";
import { StudyRoomsPresence } from "./study-rooms.presence";
import { IceServersService } from "./ice-servers.service";

@Module({
  imports: [
    // The gateway verifies access tokens off the socket handshake itself,
    // since HTTP guards never run for websocket connections.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  controllers: [StudyRoomsController],
  providers: [StudyRoomsService, StudyRoomsGateway, StudyRoomsPresence, IceServersService],
})
export class StudyRoomsModule {}
