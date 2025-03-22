<template>
  <div class="teacher-post-container">
    <teacher-card
      :teacher-data="teacherData"
      @update="handleTeacherDataUpdate"
    />

    <a-card class="schedule-card" :style="{ marginTop: '16px' }">
      <template #title>课程安排</template>

      <a-form :model="scheduleForm" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="duration" label="课程时长">
              <a-select v-model="scheduleForm.duration" placeholder="请选择课程时长">
                <a-option value="60">60分钟</a-option>
                <a-option value="90">90分钟</a-option>
                <a-option value="120">120分钟</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="frequency" label="每周频率">
              <a-select v-model="scheduleForm.frequency" placeholder="请选择上课频率">
                <a-option value="1">每周1次</a-option>
                <a-option value="2">每周2次</a-option>
                <a-option value="3">每周3次</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item field="availableTime" label="可授课时间">
          <a-space direction="vertical" style="width: 100%">
            <a-checkbox-group v-model="scheduleForm.availableTime">
              <a-row :gutter="16">
                <a-col :span="8" v-for="time in timeSlots" :key="time.value">
                  <a-checkbox :value="time.value">{{ time.label }}</a-checkbox>
                </a-col>
              </a-row>
            </a-checkbox-group>
          </a-space>
        </a-form-item>

        <a-form-item field="requirements" label="其他要求">
          <a-textarea
            v-model="scheduleForm.requirements"
            placeholder="请输入其他要求（如上课地点、教材要求等）"
            :max-length="200"
            show-word-limit
          />
        </a-form-item>

        <div class="form-actions">
          <a-button type="primary" @click="handleScheduleSubmit">保存课程安排</a-button>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import axios from 'axios'
import TeacherCard from '../components/TeacherCard.vue'
import { useUserStore } from '../stores/user'

// 初始化 Pinia store
const userStore = useUserStore()

// 教师基本信息
const teacherData = ref({
  city: '',
  grades: [],
  subjects: [],
  education: '',
  isNormalSchool: false,
  teachingExperience: 0,
  introduction: ''
})

// 课程安排表单数据
const scheduleForm = ref({
  duration: '90',
  frequency: '2',
  availableTime: [],
  requirements: ''
})

// 加载教师数据
const loadTeacherData = async () => {
  try {
    if (!userStore.checkLoginStatus()) return
    
    // 获取教师ID
    const tutorId = userStore.getTutorId
    if (!tutorId) {
      // 如果没有教师ID，可能是新注册用户
      Message.info('您需要先创建教师资料')
      return
    }
    
    const response = await axios.get(`http://localhost:3000/api/tutors/${tutorId}`, {
      headers: userStore.getAuthHeader
    })
    
    if (response.data.status === 'success') {
      const tutorData = response.data.data.tutor
      
      // 转换数据格式以符合组件需要
      teacherData.value = {
        city: tutorData.location?.city || '',
        grades: tutorData.subjects?.flatMap(s => s.grade) || [],
        subjects: tutorData.subjects?.map(s => s.name) || [],
        education: tutorData.education?.degree || '',
        isNormalSchool: tutorData.education?.school?.includes('师范') || false,
        teachingExperience: tutorData.subjects?.[0]?.yearsOfExperience || 0,
        introduction: tutorData.introduction || ''
      }
      
      // 加载课程安排数据
      scheduleForm.value = {
        duration: tutorData.duration?.toString() || '90',
        frequency: tutorData.frequency?.toString() || '2',
        availableTime: tutorData.availableTime || [],
        requirements: tutorData.requirements || ''
      }
    }
  } catch (error) {
    console.error('加载教师数据失败:', error)
    Message.error('加载数据失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadTeacherData()
})

// 可选时间段
const timeSlots = [
  { label: '工作日上午', value: 'weekday-morning' },
  { label: '工作日下午', value: 'weekday-afternoon' },
  { label: '工作日晚上', value: 'weekday-evening' },
  { label: '周末上午', value: 'weekend-morning' },
  { label: '周末下午', value: 'weekend-afternoon' },
  { label: '周末晚上', value: 'weekend-evening' }
]

// 处理教师信息更新
const handleTeacherDataUpdate = (data) => {
  teacherData.value = data
  // 更新由TeacherCard组件处理，这里只需更新本地数据
}

// 处理课程安排提交
const handleScheduleSubmit = async () => {
  if (!scheduleForm.value.availableTime.length) {
    Message.error('请至少选择一个可授课时间段')
    return
  }
  
  try {
    if (!userStore.checkLoginStatus()) return
    
    // 获取教师ID
    const tutorId = userStore.getTutorId
    if (!tutorId) {
      // 如果没有教师ID，可能是新注册用户
      Message.info('您需要先创建教师资料')
      return
    }
    
    // 根据API文档要求格式化数据
    const scheduleData = {
      availableTime: scheduleForm.value.availableTime,
      duration: parseInt(scheduleForm.value.duration),
      frequency: parseInt(scheduleForm.value.frequency),
      hourlyRate: 0, // 这里可以添加时薪设置
      requirements: scheduleForm.value.requirements
    }
    
    const response = await axios.patch(
      `http://localhost:3000/api/tutors/${tutorId}/schedule`,
      scheduleData,
      {
        headers: {
          ...userStore.getAuthHeader,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.status === 'success') {
      Message.success('课程安排保存成功')
    } else {
      throw new Error('保存失败')
    }
  } catch (error) {
    console.error('保存课程安排失败:', error)
    Message.error('保存失败: ' + (error.response?.data?.message || error.message))
  }
}
</script>

<style scoped>
.teacher-post-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.schedule-card {
  background-color: #fff;
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}

@media (max-width: 768px) {
  .teacher-post-container {
    padding: 16px;
  }
}
</style>