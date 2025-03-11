<template>
  <div class="register-container">
    <a-card class="register-card" :style="{ width: '400px' }">
      <template #title>教师注册</template>
      <a-form :model="form" @submit="handleSubmit">
        <a-form-item
          field="username"
          :rules="[
            { required: true, message: '请输入用户名' },
            { minLength: 3, message: '用户名至少3个字符' },
            { maxLength: 30, message: '用户名最多30个字符' },
          ]"
        >
          <a-input v-model="form.username" placeholder="请输入用户名">
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item
          field="password"
          :rules="[
            { required: true, message: '请输入密码' },
            { minLength: 8, message: '密码至少8个字符' },
          ]"
        >
          <a-input-password v-model="form.password" placeholder="请输入密码">
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item
          field="confirmPassword"
          :rules="[
            { required: true, message: '请确认密码' },
            {
              validator: (value) => value === form.password,
              message: '两次输入的密码不一致',
            },
          ]"
        >
          <a-input-password
            v-model="form.confirmPassword"
            placeholder="请确认密码"
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" long>注册</a-button>
        </a-form-item>
        <div class="text-center">
          已有账号？ <router-link to="/login">立即登录</router-link>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
});

const handleSubmit = async () => {
  try {
    await userStore.register(form.value);
    Message.success('注册成功');
    router.push('/login');
  } catch (error) {
    console.error('注册失败:', error);
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-fill-2);
}
.register-card {
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.text-center {
  text-align: center;
}
</style>
