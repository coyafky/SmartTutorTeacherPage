<template>
  <div class="profile-container">
    <a-card title="个人资料" :style="{ marginBottom: '16px' }">
      <a-form :model="form" @submit="handleSubmit">
        <a-form-item field="name" label="姓名">
          <a-input v-model="form.name" placeholder="请输入姓名" />
        </a-form-item>

        <a-form-item field="gender" label="性别">
          <a-radio-group v-model="form.gender">
            <a-radio value="male">男</a-radio>
            <a-radio value="female">女</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item field="phone" label="联系电话">
          <a-input v-model="form.phone" placeholder="请输入联系电话" />
        </a-form-item>

        <a-form-item field="email" label="邮箱">
          <a-input v-model="form.email" placeholder="请输入邮箱" />
        </a-form-item>

        <a-form-item field="subjects" label="教授科目">
          <a-select v-model="form.subjects" multiple placeholder="请选择教授科目">
            <a-option value="math">数学</a-option>
            <a-option value="english">英语</a-option>
            <a-option value="chinese">语文</a-option>
            <a-option value="physics">物理</a-option>
            <a-option value="chemistry">化学</a-option>
          </a-select>
        </a-form-item>

        <a-form-item field="introduction" label="个人简介">
          <a-textarea
            v-model="form.introduction"
            placeholder="请输入个人简介"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit">保存修改</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="修改密码">
      <a-form :model="passwordForm" @submit="handlePasswordSubmit">
        <a-form-item field="oldPassword" label="原密码">
          <a-input-password v-model="passwordForm.oldPassword" placeholder="请输入原密码" />
        </a-form-item>

        <a-form-item field="newPassword" label="新密码">
          <a-input-password v-model="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>

        <a-form-item field="confirmPassword" label="确认密码">
          <a-input-password
            v-model="passwordForm.confirmPassword"
            placeholder="请确认新密码"
          />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit">修改密码</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'

const form = ref({
  name: '',
  gender: 'male',
  phone: '',
  email: '',
  subjects: [],
  introduction: ''
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  try {
    // TODO: 调用API保存个人信息
    Message.success('保存成功')
  } catch (error) {
    Message.error('保存失败')
    console.error(error)
  }
}

const handlePasswordSubmit = async () => {
  try {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      Message.error('两次输入的密码不一致')
      return
    }
    // TODO: 调用API修改密码
    Message.success('密码修改成功')
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    Message.error('密码修改失败')
    console.error(error)
  }
}
</script>

<style scoped>
.profile-container {
  padding: 16px;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 8px;
  }
}
</style>