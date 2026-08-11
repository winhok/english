import { ChatDeepSeek } from '@langchain/deepseek';
import { ConfigService } from '@nestjs/config';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import type { ChatDto, ThinkingEffort } from '@en/common/chat';

type DeepSeekModelKwargs = {
  thinking: {
    type: 'enabled' | 'disabled';
  };
  reasoning_effort?: ThinkingEffort;
};

const assertThinkingEffortSupported: (
  effort: unknown,
  professionalMode: boolean,
) => asserts effort is ThinkingEffort | undefined = (
  effort,
  professionalMode,
) => {
  if (effort === undefined) return;
  if (effort !== 'low' && effort !== 'high' && effort !== 'max') {
    throw new Error('无效的思考强度');
  }
  if (professionalMode && effort === 'low') {
    throw new Error('当前模型不支持该思考强度');
  }
};

export const createDeepSeek = (
  options: Pick<ChatDto, 'professionalMode' | 'thinkingEffort'> = {},
) => {
  const configService = new ConfigService();
  assertThinkingEffortSupported(
    options.thinkingEffort,
    options.professionalMode ?? false,
  );
  const thinkingEnabled = options.thinkingEffort !== undefined;
  const modelKwargs: DeepSeekModelKwargs = {
    thinking: { type: thinkingEnabled ? 'enabled' : 'disabled' },
  };
  if (options.thinkingEffort) {
    modelKwargs.reasoning_effort = options.thinkingEffort;
  }

  return new ChatDeepSeek({
    apiKey: configService.get<string>('DEEPSEEK_API_KEY'),
    model: configService.get<string>(
      options.professionalMode
        ? 'DEEPSEEK_API_MODEL_PRO'
        : 'DEEPSEEK_API_MODEL',
    ),
    temperature: 1.3,
    maxTokens: options.professionalMode ? 18000 : 4096,
    streaming: true,
    modelKwargs,
  });
};

export const createCheckPoint = async () => {
  const configService = new ConfigService();
  const checkpointer = PostgresSaver.fromConnString(
    configService.get<string>('AI_DATABASE_URL')!,
  );
  await checkpointer.setup();
  return checkpointer;
};

export const createBochaSearch = async (query: string, count: number = 10) => {
  const configService = new ConfigService();
  const bochaURL = configService.get<string>('BOCHA_SEARCH_URL');
  const bochaAPIKey = configService.get<string>('BOCHA_API_KEY');
  const response = await fetch(`${bochaURL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bochaAPIKey}`,
    },
    body: JSON.stringify({
      query,
      count,
      summary: true,
    }),
  });
  const { code, msg, data } = (await response.json()) as {
    code: number;
    msg?: string | null;
    data: {
      webPages: {
        value: {
          name: string;
          url: string;
          summary: string;
          siteName: string;
          siteIcon: string;
          dateLastCrawled: string;
        }[];
      };
    } | null;
  };
  if (code !== 200 || !data) {
    return `搜索API请求失败，原因是: ${msg ?? '未知错误'}`;
  }
  const values = data.webPages.value;
  const prompt: string = values
    .map(
      (item) => `
       标题：${item.name}
       链接：${item.url}
       摘要：${item.summary?.replace(/\n/g, '') ?? ''}
       网站名称：${item.siteName}
       网站logo：${item.siteIcon}
       发布时间：${item.dateLastCrawled}
    `,
    )
    .join('\n');
  return prompt;
};
