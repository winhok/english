import { ref, computed } from "vue";
import { defineStore } from "pinia";
import type { WebResultUser, Token, UserUpdate } from "@en/common/user";

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
    const updateUser = (params: UserUpdate) => {
      user.value!.name = params.name;
      user.value!.email = params.email;
      user.value!.address = params.address;
      user.value!.avatar = params.avatar;
      user.value!.bio = params.bio;
      user.value!.isTimingTask = params.isTimingTask;
      user.value!.timingTaskTime = params.timingTaskTime;
    };
    const getUpdateUser = computed<UserUpdate>(() => {
      const { name, email, address, avatar, bio, isTimingTask, timingTaskTime } = user.value!;
      return { name, email, address, avatar, bio, isTimingTask, timingTaskTime };
    });
    const getUser = computed(() => user.value);
    const logout = () => {
      user.value = null;
    };
    return {
      user,
      setUser,
      getUser,
      logout,
      getAccessToken,
      getRefreshToken,
      updateToken,
      updateUser,
      getUpdateUser,
    };
  },
  { persist: true },
);
