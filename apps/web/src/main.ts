import "@/assets/base.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import focus from "./directives/focus";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(ElementPlus, {
  locale: zhCn,
});
app.use(router);
app.use(focus);
app.mount("#app");
