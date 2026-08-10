import { createRouter, createWebHistory } from "vue-router";
import home from "./home/index";
import wordBook from "./word-book/index";
import setting from "./setting/index";
import chat from "./chat/index";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...home, ...wordBook, ...setting, ...chat],
});

export default router;
