import { chatMode } from '../prompt/prompt.mode';
import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  createDeepSeek,
  createCheckPoint,
  createBochaSearch,
} from '../llm/llm.config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import type { ChatRoleType, ChatDto } from '@en/common/chat';
import { AIMessageChunk, createAgent } from 'langchain';
import { ResponseService } from '@libs/shared';

@Injectable()
export class ChatService implements OnModuleInit {
  constructor(private readonly responseService: ResponseService) {}
  private checkpointer!: PostgresSaver;

  async onModuleInit() {
    this.checkpointer = await createCheckPoint();
  }

  async streamCompletion(createChatDto: ChatDto) {
    const promptObject = chatMode.find(
      (item) => item.role === createChatDto.role,
    );
    if (!promptObject) {
      throw new Error('模式不存在');
    }
    let prompt = promptObject.prompt;
    if (createChatDto.webSearch) {
      const webSearchPrompt = await createBochaSearch(createChatDto.content);
      prompt += `\n\n请根据以下搜索结果回答问题：\n${webSearchPrompt}(并且返回你参考的网站名称)，用户问题：${createChatDto.content}`;
    }
    const model = createDeepSeek({
      professionalMode: createChatDto.professionalMode,
      thinkingEffort: createChatDto.thinkingEffort,
    });
    const agent = createAgent({
      model: model,
      systemPrompt: prompt,
      checkpointer: this.checkpointer,
    });
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
        reasoning: item.additional_kwargs?.reasoning_content ?? '',
      })),
    );
  }
}
