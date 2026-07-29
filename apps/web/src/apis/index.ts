import axios from "axios";

const timeout = 50000;

export const serverApi = axios.create({
  baseURL: "/api/v1",
  timeout,
});

serverApi.interceptors.response.use((res) => {
  return res.data;
});

export const aiApi = axios.create({
  baseURL: "/api/ai/v1",
  timeout,
});

aiApi.interceptors.response.use((res) => {
  return res.data;
});

export interface Response<T = any> {
  timestamp: string;
  path: string;
  message: string;
  code: Number;
  success: boolean;
  data: T;
}
