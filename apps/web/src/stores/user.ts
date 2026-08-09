import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { WebResultUser, Token } from "@en/common/user";

export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<WebResultUser | null>(null);
    const setUser = (params: WebResultUser) => {
      user.value = params;
    };
    const getAccessToken = computed(() => user.value?.token.accessToken);
    const getRefreshToken = computed(() => user.value?.token.refreshToken);
    const updateToken = (token: Token) => {
      user.value!.token = token;
    };
    const getUser = computed(() => user.value);
    const logout = () => {
      user.value = null;
    };
    return { user, setUser, getUser, logout, getAccessToken, getRefreshToken, updateToken };
  },
  { persist: true },
);
