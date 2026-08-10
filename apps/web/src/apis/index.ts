import axios from "axios";
import { useUserStore } from "@/stores/user";
import router from "@/router";
import { refreshTokenApi } from "./auth";
import { ElMessage } from "element-plus";

export const uploadUrl = import.meta.env.DEV ? "http://127.0.0.1:9000" : "https://api.engilish.com";

const timeout = 50000;

export const serverApi = axios.create({
  baseURL: "/api/v1",
  timeout,
});

let isRefreshing = false;
let requestQueue: ((newAccessToken: string) => void)[] = [];

serverApi.interceptors.request.use((config) => {
  const userStore = useUserStore();
  if (userStore.getAccessToken) {
    config.headers.Authorization = `Bearer ${userStore.getAccessToken}`;
  }
  return config;
});

serverApi.interceptors.response.use(
  (res) => {
    return res.data;
  },
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      ElMessage.error("网络连接失败，请重试");
      return Promise.reject(error);
    }
    if (error.response.status !== 401) {
      ElMessage.error("服务器异常，请稍后再试");
      return Promise.reject(error);
    }
    const userStore = useUserStore();
    const accessToken = userStore.getAccessToken;
    const refreshToken = userStore.getRefreshToken;
    const originalRequest = error.config;
    if (!accessToken || !refreshToken) {
      userStore.logout();
      ElMessage.error("登录已过期，请重新登录");
      router.replace("/");
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        requestQueue.push((newAccessToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(serverApi(originalRequest));
        });
      });
    }
    isRefreshing = true;
    try {
      const newToken = await refreshTokenApi({ refreshToken: refreshToken });
      if (newToken.success) {
        userStore.updateToken(newToken.data);
      } else {
        userStore.logout();
        ElMessage.error("登录已过期，请重新登录");
        router.replace("/");
        return Promise.reject(error);
      }
      const newAccessToken = newToken.data.accessToken;
      requestQueue.forEach((callback) => callback(newAccessToken));
      return serverApi(originalRequest);
    } catch (err) {
      userStore.logout();
      router.replace("/");
      return Promise.reject(err);
    } finally {
      requestQueue = [];
      isRefreshing = false;
    }
  },
);

export const aiApi = axios.create({
  baseURL: "/api/ai/v1",
  timeout,
});

aiApi.interceptors.response.use((res) => {
  return res.data;
});
