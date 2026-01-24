// src/chat/chat.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatGateway } from './gateway/chat.gateway';
import { AuthModule } from '../auth/auth.module'; // Importe AuthModule
import { CacheModule } from '../cache/cache.module';
import { ChatRateLimitService } from './chat-rate-limit.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule), // avoid circular dependency with Auth → Notifications → Chat
    CacheModule,
    NotificationsModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatRateLimitService],
  exports: [ChatService, ChatGateway], // Exporta ChatService e ChatGateway para outros módulos
})
export class ChatModule {}
