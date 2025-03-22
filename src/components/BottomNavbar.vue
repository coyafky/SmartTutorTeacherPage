<template>
  <nav>
    <div class="nav-container">
      <NavbarItem
        v-for="(item, index) in navItems"
        :key="index"
        :item="item"
        :active="activeIndex === index"
        @click="handleClick(index)"
      />
    </div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import NavbarItem from './NavbarItem.vue';

const router = useRouter();
const navItems = ref([
  { name: '首页', icon: 'home', path: '/home' },
  { name: '找帖子', icon: 'team', path: '/students' },
  { name: '资料卡填写', icon: 'edit', path: '/teacherpost' },
  { name: '我的', icon: 'user', path: '/profile' },
]);

// 当前激活的导航项
const activeIndex = ref(0);
watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    activeIndex.value = navItems.value.findIndex(
      (item) => item.path === newPath
    );
  },
  {
    immediate: true,
  }
);

// 点击导航项时切换路由
const handleClick = (index) => {
  activeIndex.value = index;
  router.push(navItems.value[index].path);
};
</script>

<style scoped>
nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-container {
  width: 100%;
  max-width: 750px;
  height: 56px;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
}

/* 平板设备的样式调整 */
@media (min-width: 768px) and (max-width: 1024px) {
  .nav-container {
    max-width: 90%;
  }
}

/* 移动设备的样式调整 */
@media (max-width: 767px) {
  .nav-container {
    width: 100%;
  }
}
</style>
