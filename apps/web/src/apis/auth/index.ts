import axios from "axios";
import type { ApiResponse } from "@en/common/http";
import type { Token } from "@en/common/user";

const refreshServer = axios.create({
  baseURL: "/api/v1",
  timeout: 50000,
});

refreshServer.interceptors.response.use(
  (res) => {
    return res.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const refreshTokenApi = (data: Omit<Token, "accessToken">) =>
  refreshServer.post("/user/refresh-token", data) as Promise<ApiResponse<Token>>;
