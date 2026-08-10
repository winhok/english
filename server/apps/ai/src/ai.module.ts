import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ChatModule } from './chat/chat.module';
import { SharedModule } from '@libs/shared';
import { PromptModule } from './prompt/prompt.module';

@Module({
  imports: [ChatModule, SharedModule, PromptModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
