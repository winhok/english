import axios from "axios";
import type { Response } from "..";
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
  refreshServer.post("/user/refresh-token", data) as Promise<Response<Token>>;
