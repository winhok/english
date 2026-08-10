import { chatMode } from '../prompt/prompt.mode';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createDeepSeek, createCheckPoint } from '../llm/llm.config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import type { ChatRoleType, ChatDto } from '@en/common/chat';
import { AIMessageChunk, createAgent, type ReactAgent } from 'langchain';
import { ResponseService } from '@libs/shared';

@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) {}
  private checkpointer!: PostgresSaver;
  private agents: Map<ChatRoleType, ReactAgent> = new Map();

  async onModuleInit() {
    this.checkpointer = await createCheckPoint();
    for (const mode of chatMode) {
      const agent = createAgent({
        model: createDeepSeek(),
        systemPrompt: mode.prompt,
        checkpointer: this.checkpointer,
      });
      this.agents.set(mode.role, agent);
    }
  }

  streamCompletion(createChatDto: ChatDto) {
    const agent = this.agents.get(createChatDto.role);
    if (!agent) {
      throw new Error('模式不存在');
    }
    const id = `${createChatDto.userId}-${createChatDto.role}`;
    const stream = agent.stream(
      {
        messages: [{ role: 'human', content: createChatDto.content }],
      },
      {
        configurable: { thread_id: id },
        streamMode: 'messages',
      },
    );
    return stream;
  }

  async findAll(userId: string, role: ChatRoleType) {
    const messages = await this.checkpointer.get({
      configurable: { thread_id: `${userId}-${role}` },
    });
    const list = messages?.channel_values?.messages as AIMessageChunk[];
    if (!list) return this.responseService.success([]);
    return this.responseService.success(
      list.map((item) => ({
        content: item.content,
        role: item.type,
      })),
    );
  }
}
