<template>
  <div class="flex-1 h-187.5 p-5 bg-purple-50 flex flex-col">
    <div class="flex-1 overflow-y-auto">
      <div v-for="(item, index) in list" :key="index">
        <div class="flex justify-end items-center gap-4 mt-5 mb-5 mr-5" v-if="item.role === 'human'">
          <div class="text-sm text-white max-w-[80%] rounded-lg p-2 bg-blue-500 shadow-md">
            {{ item.content }}
          </div>
          <div>
            <el-avatar :size="35">user</el-avatar>
          </div>
        </div>
        <div class="flex justify-start items-center gap-4 mt-5 mb-5" v-else>
          <div><el-avatar :size="35">AI</el-avatar></div>
          <div>
            <div v-if="item.role === 'ai' && item.reasoning" class="text-[12px] text-gray-500 max-w-[80%] p-2">
              {{ item.reasoning }}
            </div>
            <div
              v-if="item.role === 'ai' && item.content !== ''"
              class="text-sm text-gray-700 max-w-[80%] bg-white rounded-lg mt-2 deepseek-markdown"
              v-html="parseMarkdown(item.content)"
            />
          </div>
        </div>
      </div>
      <div ref="chatRef"></div>
    </div>
    <div class="flex p-5 border-t border-gray-200 box-border flex-col gap-3">
      <div class="flex items-center gap-3">
        <div
          class="flex items-center gap-1 px-3 py-1 rounded-full text-xs cursor-pointer transition-all border"
          :class="
            professionalMode
              ? 'bg-purple-100 border-purple-400 text-purple-700'
              : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
          "
          @click="professionalMode = !professionalMode"
        >
          <span>✨</span>
          <span>专业模式</span>
        </div>
        <div
          class="flex items-center gap-1 px-3 py-1 rounded-full text-xs cursor-pointer transition-all border"
          :class="
            webSearch
              ? 'bg-blue-100 border-blue-400 text-blue-700'
              : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
          "
          @click="webSearch = !webSearch"
        >
          <span>🌐</span>
          <span>联网搜索</span>
        </div>
        <el-dropdown trigger="click" @command="selectThinkingEffort">
          <div
            class="flex items-center gap-1 px-3 py-1 rounded-full text-xs cursor-pointer transition-all border outline-none"
            :class="
              thinkingEffort
                ? 'bg-amber-100 border-amber-400 text-amber-700'
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
            "
          >
            <span>🧠</span>
            <span>{{ thinkingButtonLabel }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="">关闭</el-dropdown-item>
              <el-dropdown-item v-for="option in availableThinkingEfforts" :key="option.value" :command="option.value">
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="flex">
        <el-input @keyup.enter="sendMessage" type="textarea" :rows="2" v-model="message" placeholder="请输入内容" />
        <el-button class="ml-2" :icon="Position" type="primary" @click="sendMessage"></el-button>
        <el-button v-if="!isRecording" class="ml-2" :icon="Mic" type="primary" @click="startRecording"></el-button>
        <el-button v-else class="ml-2" :icon="VideoPause" type="primary" @click="stopRecording"></el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch, nextTick } from "vue";
import { Mic, Position, VideoPause } from "@element-plus/icons-vue";
import type { ChatMessageList, ThinkingEffort } from "@en/common/chat";
import { marked } from "marked";
import "@/assets/css/deep-seek.css";
import { useVoiceToText } from "@/hooks/useVoiceToText";

const { isRecording, start, stop } = useVoiceToText({
  lang: "zh-CN",
  continuous: true,
});

const thinkingEffortOptions = [
  {
    value: "low",
    label: "低强度",
    shortLabel: "低",
    supportedModels: ["flash"],
  },
  {
    value: "high",
    label: "高强度",
    shortLabel: "高",
    supportedModels: ["flash", "pro"],
  },
  {
    value: "max",
    label: "最大强度",
    shortLabel: "最大",
    supportedModels: ["flash", "pro"],
  },
] as const satisfies ReadonlyArray<{
  value: ThinkingEffort;
  label: string;
  shortLabel: string;
  supportedModels: ReadonlyArray<"flash" | "pro">;
}>;

const professionalMode = shallowRef(false);
const webSearch = shallowRef(false);
const thinkingEffort = shallowRef<ThinkingEffort>();

const currentModel = computed(() => (professionalMode.value ? "pro" : "flash"));

const availableThinkingEfforts = computed(() =>
  thinkingEffortOptions.filter((option) =>
    option.supportedModels.some((supportedModel) => supportedModel === currentModel.value),
  ),
);

const thinkingButtonLabel = computed(() =>
  thinkingEffort.value
    ? `深度思考 · ${thinkingEffortOptions.find((option) => option.value === thinkingEffort.value)?.shortLabel}`
    : "深度思考",
);

const emits = defineEmits<{
  onSendMessage: [message: string, professionalMode: boolean, webSearch: boolean, thinkingEffort?: ThinkingEffort];
}>();

const chatRef = useTemplateRef<HTMLDivElement>("chatRef");

const props = defineProps<{
  list?: ChatMessageList;
}>();

const message = ref<string>("");

const sendMessage = () => {
  if (!message.value) return;
  emits("onSendMessage", message.value, professionalMode.value, webSearch.value, thinkingEffort.value);
  message.value = "";
};

const selectThinkingEffort = (effort: ThinkingEffort | "") => {
  thinkingEffort.value = effort || undefined;
};

const parseMarkdown = (content: string) => {
  if (!content) return "";
  return marked.parse(content);
};

const startRecording = () => {
  start((result) => {
    message.value = result;
  });
};

const stopRecording = () => {
  stop();
  sendMessage();
};

watch(professionalMode, () => {
  if (thinkingEffort.value && !availableThinkingEfforts.value.some((option) => option.value === thinkingEffort.value)) {
    thinkingEffort.value = undefined;
  }
});

watch(
  () => props.list,
  () => {
    nextTick(() => {
      chatRef.value?.scrollIntoView({ behavior: "smooth" });
    });
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>
