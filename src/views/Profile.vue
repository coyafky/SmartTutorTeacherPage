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
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import axios from 'axios'
import { useUserStore } from '../stores/user'

const loading = ref(false)
const userStore = useUserStore()
const form = ref({
  tutorId: '',
  name: '',
  gender: 'male',
  age: 30,
  avatar: '',
  phone: '',
  email: '',
  introduction: '',
  education: {
    degree: '',
    major: '',
    school: '',
    graduationYear: null
  },
  subjects: [],
  location: {
    city: '',
    district: ''
  },
  availableTime: [],
  hourlyRate: 0
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 获取教师个人资料
const fetchProfile = async () => {
  loading.value = true
  try {
    // 使用 Pinia 检查登录状态
    if (!userStore.checkLoginStatus()) {
      loading.value = false
      return
    }
    
    // 获取教师ID
    const tutorId = userStore.getTutorId
    if (!tutorId) {
      // 如果没有教师ID，可能是新注册用户，显示空表单
      loading.value = false
      return
    }
    
    const response = await axios.get(`http://localhost:3000/api/tutors/${tutorId}`, {
      headers: userStore.getAuthHeader
    })
    
    if (response.data.status === 'success') {
      const tutorData = response.data.data.tutor
      form.value = {
        tutorId: tutorData.tutorId,
        name: tutorData.name,
        gender: tutorData.gender === '男' ? 'male' : 'female',
        age: tutorData.age || 30,
        avatar: tutorData.avatar || '',
        phone: tutorData.contactInfo?.phone || '',
        email: tutorData.contactInfo?.email || '',
        introduction: tutorData.introduction || '',
        education: {
          degree: tutorData.education?.degree || '',
          major: tutorData.education?.major || '',
          school: tutorData.education?.school || '',
          graduationYear: tutorData.education?.graduationYear || null
        },
        subjects: tutorData.subjects?.map(s => s.name) || [],
        location: {
          city: tutorData.location?.city || '',
          district: tutorData.location?.district || ''
        },
        availableTime: tutorData.availableTime || [],
        hourlyRate: tutorData.hourlyRate || 0
      }
    }
  } catch (error) {
    console.error('获取个人资料失败:', error)
    Message.error('获取个人资料失败: ' + (error.response?.data?.message || error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 保存教师个人资料
const handleSubmit = async () => {
  try {
    // 使用 Pinia 检查登录状态
    if (!userStore.checkLoginStatus()) return
    
    // 获取教师ID
    const tutorId = userStore.getTutorId
    if (!tutorId) {
      // 如果没有教师ID，需要创建新的教师资料
      Message.info('正在创建教师资料，请补充完整信息')
      // 这里可以添加创建教师资料的逻辑
      return
    }
    
    // 转换数据格式以符合API要求
    const profileData = {
      name: form.value.name,
      gender: form.value.gender === 'male' ? '男' : '女',
      age: form.value.age,
      avatar: form.value.avatar,
      introduction: form.value.introduction,
      contactInfo: {
        phone: form.value.phone,
        email: form.value.email
      },
      education: form.value.education,
      location: form.value.location,
      availableTime: form.value.availableTime,
      hourlyRate: form.value.hourlyRate
    }
    
    const response = await axios.patch(
      `http://localhost:3000/api/tutors/${tutorId}`,
      profileData,
      {
        headers: {
          ...userStore.getAuthHeader,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.status === 'success') {
      Message.success('保存成功')
      // 更新用户信息
      await userStore.updateUserInfo({
        name: form.value.name,
        tutorId: form.value.tutorId
      })
    } else {
      throw new Error(response.data.message || '保存失败')
    }
  } catch (error) {
    console.error('保存个人资料失败:', error)
    Message.error('保存失败: ' + (error.response?.data?.message || error.message))
  }
}

// 修改密码
const handlePasswordSubmit = async () => {
  try {
    // 验证密码
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      Message.error('两次输入的密码不一致')
      return
    }
    
    // 使用 Pinia 检查登录状态
    if (!userStore.checkLoginStatus()) return
    
    // 获取用户ID，从用户对象中获取
    const userId = userStore.getUserId
    if (!userId) {
      Message.error('用户ID不存在')
      return
    }
    
    const response = await axios.patch(
      `http://localhost:3000/api/users/${userId}/password`,
      {
        currentPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      },
      {
        headers: {
          ...userStore.getAuthHeader,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.status === 'success') {
      Message.success('密码修改成功')
      // 清空表单
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      throw new Error('密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    Message.error('密码修改失败: ' + (error.response?.data?.message || error.message))
  }
}

// 页面加载时获取个人资料
onMounted(() => {
  fetchProfile()
})
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