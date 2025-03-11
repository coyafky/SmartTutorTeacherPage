<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import BottomNavbar from './components/BottomNavbar.vue'

const route = useRoute()
const userStore = useUserStore()

// 是否显示导航栏
const showNav = computed(() => {
  return userStore.token && route.meta.showNav
})
</script>

<template>
  <div class="app-container">
    <div class="content-wrapper">
      <main :class="{ 'has-nav': showNav }">
        <router-view />
      </main>
      <BottomNavbar v-if="showNav" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background-color: var(--color-bg-1);
}

.content-wrapper {
  position: relative;
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-2);
}

main {
  flex: 1;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.has-nav {
  padding-bottom: 72px; /* 导航栏高度 + 安全间距 */
}

/* 平板设备的样式调整 */
@media (min-width: 768px) and (max-width: 1024px) {
  .content-wrapper {
    max-width: 90%;
  }

  main {
    padding: 24px;
  }
}

/* 移动设备的样式调整 */
@media (max-width: 767px) {
  .content-wrapper {
    width: 100%;
  }

  main {
    padding: 16px;
  }
}
</style>
