import { serverApi } from "..";
import type { ApiResponse } from "@en/common/http";
import type { UserLogin, UserRegister, WebResultUser, AvatarResult, UserUpdate } from "@en/common/user";

export const login = (data: UserLogin) => serverApi.post("/user/login", data) as Promise<ApiResponse<WebResultUser>>;

export const register = (data: UserRegister) =>
  serverApi.post("/user/register", data) as Promise<ApiResponse<WebResultUser>>;

export const uploadAvatar = (file: FormData) =>
  serverApi.post("/user/upload-avatar", file) as Promise<ApiResponse<AvatarResult>>;

export const updateUser = (data: UserUpdate) =>
  serverApi.post("/user/update-user", data) as Promise<ApiResponse<UserUpdate>>;
