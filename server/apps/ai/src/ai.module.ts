import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatModule } from './chat/chat.module';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [ChatModule, SharedModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
