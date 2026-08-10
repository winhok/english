<template>
  <div class="w-300 mx-auto flex mt-10">
    <Conversations @onGetRole="getRole" />
    <Bubble :list="list" @onSendMessage="sendMessage" />
  </div>
</template>
<script setup lang="ts">
import Conversations from "./components/Conversations.vue";
import Bubble from "./components/Bubble.vue";
import type { ChatRoleType, ChatMessageList, ChatMessage, ChatDto } from "@en/common/chat";
import { getChatHistory } from "@/apis/chat";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
import { sse, CHAT_URL } from "@/apis/sse";

const userStore = useUserStore();
const list = ref<ChatMessageList>([]);
const userId = userStore.user?.id;
const role = ref<ChatRoleType>("normal");

const getRole = async (params: ChatRoleType) => {
  role.value = params;
  const res = await getChatHistory(userId!, params);
  list.value = res.data;
};

const sendMessage = (message: string) => {
  list.value.push({
    role: "human",
    content: message,
  });
  list.value.push({
    role: "ai",
    content: "",
  });

  sse<ChatMessage, ChatDto>(
    CHAT_URL,
    "POST",
    {
      role: role.value,
      content: message,
      userId: userId!,
    },
    (data) => {
      const last = list.value[list.value.length - 1];
      if (!last) return;
      last.content += data.content;
    },
  );
};
</script>
