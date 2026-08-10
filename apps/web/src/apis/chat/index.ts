import { aiApi } from "..";
import type { ApiResponse } from "@en/common/http";
import type { ChatModeList, ChatRoleType, ChatMessageList } from "@en/common/chat";

export const getChatMode = () => aiApi.get("/prompt/list") as Promise<ApiResponse<ChatModeList>>;

export const getChatHistory = (userId: string, role: ChatRoleType) =>
  aiApi.get(`/chat/history?userId=${userId}&role=${role}`) as Promise<ApiResponse<ChatMessageList>>;
