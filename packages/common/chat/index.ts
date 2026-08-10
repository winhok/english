export type ChatRole = "human" | "ai";

export type ChatRoleType = "normal" | "master" | "business";

export type ChatMessage = {
  role: ChatRole;
  content: string;
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
};
