import { serverApi } from "..";
import type { ApiResponse } from "@en/common/http";
import type { WordQuery, WordList } from "@en/common/word";

export const getWordBookList = (params: WordQuery): Promise<ApiResponse<WordList>> => {
  return serverApi.get("/word-book", { params }) as Promise<ApiResponse<WordList>>;
};
