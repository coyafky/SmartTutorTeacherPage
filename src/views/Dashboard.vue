<template>
  <div class="dashboard-container">
    <a-layout>
      <a-layout-header class="header">
        <div class="logo">教师管理系统</div>
        <div class="user-info">
          <span>欢迎，{{ user?.username }}</span>
          <a-button type="text" @click="handleLogout">退出登录</a-button>
        </div>
      </a-layout-header>
      <a-layout>
        <a-layout-sider width="200" style="background: #fff">
          <a-menu
            mode="vertical"
            :default-selected-keys="['1']"
            style="height: 100%"
          >
            <a-menu-item key="1">个人信息</a-menu-item>
            <a-menu-item key="2">课程管理</a-menu-item>
            <a-menu-item key="3">学生管理</a-menu-item>
            <a-menu-item key="4">消息通知</a-menu-item>
          </a-menu>
        </a-layout-sider>
        <a-layout-content style="padding: 24px; min-height: calc(100vh - 64px)">
          <a-card>
            <template #title>个人信息</template>
            <p>欢迎使用教师管理系统！</p>
            <p>这里将显示您的个人信息和教学数据。</p>
          </a-card>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const user = computed(() => userStore.getUser);

const handleLogout = () => {
  userStore.logout();
  Message.success('已退出登录');
  router.push('/login');
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.logo {
  font-size: 18px;
  font-weight: bold;
  color: #165dff;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
