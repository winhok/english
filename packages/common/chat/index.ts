export type ChatRole = "human" | "ai";

export type ChatRoleType = "normal" | "master" | "business";

export type ChatMessageType = "reasoning" | "chat";

export type FlashThinkingEffort = "low" | "high" | "max";

export type ProThinkingEffort = Exclude<FlashThinkingEffort, "low">;

export type ThinkingEffort = FlashThinkingEffort;

export type ChatMessage = {
  role: ChatRole;
  content: string;
  reasoning?: string;
  type: ChatMessageType;
};

export type ChatMessageList = ChatMessage[];

export type ChatMode = {
  label: string;
  id: string;
  role: ChatRoleType;
};

export type ChatModeList = ChatMode[];

export type ChatDto = {
  role: ChatRoleType;
  content: string;
  userId: string;
  professionalMode?: boolean;
  thinkingEffort?: ThinkingEffort;
  webSearch: boolean;
};
