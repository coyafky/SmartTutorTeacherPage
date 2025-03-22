<template>
  <a-card class="teacher-card">
    <template #title>
      <div class="card-header">
        <span>教师资料卡</span>
        <a-button v-if="!isEditing" type="text" @click="startEdit">
          <template #icon><icon-edit /></template>
          编辑
        </a-button>
      </div>
    </template>

    <div v-if="!isEditing" class="info-display">
      <a-descriptions :data="teacherInfo" layout="inline-vertical" bordered />
    </div>

    <a-form v-else ref="formRef" :model="formData" :rules="rules" @submit="handleSubmit">
      <a-form-item field="city" label="所在城市" validate-trigger="blur">
        <a-input v-model="formData.city" placeholder="请输入所在城市" />
      </a-form-item>

      <a-form-item field="grades" label="授课年级" validate-trigger="blur">
        <a-select
          v-model="formData.grades"
          placeholder="请选择授课年级"
          multiple
          allow-clear
        >
          <a-option v-for="grade in gradeOptions" :key="grade.value" :value="grade.value">
            {{ grade.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item field="subjects" label="授课科目" validate-trigger="blur">
        <a-select
          v-model="formData.subjects"
          placeholder="请选择授课科目"
          multiple
          allow-clear
        >
          <a-option v-for="subject in subjectOptions" :key="subject.value" :value="subject.value">
            {{ subject.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item field="education" label="学历" validate-trigger="blur">
        <a-select v-model="formData.education" placeholder="请选择学历">
          <a-option value="bachelor">本科</a-option>
          <a-option value="master">硕士</a-option>
          <a-option value="doctor">博士</a-option>
        </a-select>
      </a-form-item>

      <a-form-item field="isNormalSchool" label="是否师范院校">
        <a-switch v-model="formData.isNormalSchool" />
      </a-form-item>

      <a-form-item field="teachingExperience" label="教学经验" validate-trigger="blur">
        <a-input-number
          v-model="formData.teachingExperience"
          :min="0"
          :max="50"
          placeholder="请输入教学年限"
        />
        <span class="unit-text">年</span>
      </a-form-item>

      <a-form-item field="introduction" label="个人简介">
        <a-textarea
          v-model="formData.introduction"
          placeholder="请输入个人简介"
          :max-length="500"
          show-word-limit
        />
      </a-form-item>

      <div class="form-actions">
        <a-space>
          <a-button @click="cancelEdit">取消</a-button>
          <a-button type="primary" html-type="submit">保存</a-button>
        </a-space>
      </div>
    </a-form>
  </a-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import axios from 'axios'
import { useUserStore } from '../stores/user'

const props = defineProps({
  teacherData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update'])
const loading = ref(false)
const userStore = useUserStore()

const isEditing = ref(false)
const formRef = ref(null)

// 表单数据
const formData = ref({
  city: '',
  grades: [],
  subjects: [],
  education: '',
  isNormalSchool: false,
  teachingExperience: 0,
  introduction: ''
})

// 表单验证规则
const rules = {
  city: [{ required: true, message: '请输入所在城市' }],
  grades: [{ required: true, message: '请选择授课年级' }],
  subjects: [{ required: true, message: '请选择授课科目' }],
  education: [{ required: true, message: '请选择学历' }],
  teachingExperience: [{ required: true, message: '请输入教学经验' }]
}

// 年级选项
const gradeOptions = [
  { label: '小学', value: 'primary' },
  { label: '初中', value: 'junior' },
  { label: '高中', value: 'senior' }
]

// 科目选项
const subjectOptions = [
  { label: '语文', value: 'chinese' },
  { label: '数学', value: 'math' },
  { label: '英语', value: 'english' },
  { label: '物理', value: 'physics' },
  { label: '化学', value: 'chemistry' },
  { label: '生物', value: 'biology' }
]

// 教师信息展示数据
const teacherInfo = computed(() => [
  { label: '所在城市', value: props.teacherData.city },
  { label: '授课年级', value: props.teacherData.grades?.join('、') },
  { label: '授课科目', value: props.teacherData.subjects?.join('、') },
  { label: '学历', value: props.teacherData.education },
  { label: '是否师范院校', value: props.teacherData.isNormalSchool ? '是' : '否' },
  { label: '教学经验', value: `${props.teacherData.teachingExperience}年` },
  { label: '个人简介', value: props.teacherData.introduction }
])

// 开始编辑
const startEdit = () => {
  formData.value = { ...props.teacherData }
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  formRef.value?.resetFields()
  isEditing.value = false
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    
    if (!userStore.checkLoginStatus()) return
    
    // 获取教师ID
    const tutorId = userStore.getTutorId
    if (!tutorId) {
      // 如果没有教师ID，可能是新注册用户
      Message.info('您需要先创建教师资料')
      loading.value = false
      return
    }
    
    // 转换数据格式以符合API要求
    const subjectsData = formData.value.subjects.map(subject => ({
      name: subject,
      grade: formData.value.grades,
      description: '',
      yearsOfExperience: formData.value.teachingExperience || 0
    }))
    
    const tutorData = {
      education: {
        degree: formData.value.education,
        school: formData.value.isNormalSchool ? '师范院校' : '非师范院校'
      },
      location: {
        city: formData.value.city,
        district: ''
      },
      subjects: subjectsData,
      introduction: formData.value.introduction
    }
    
    const response = await axios.patch(
      `http://localhost:3000/api/tutors/${tutorId}`,
      tutorData,
      {
        headers: {
          ...userStore.getAuthHeader,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.status === 'success') {
      emit('update', formData.value)
      isEditing.value = false
      Message.success('教师资料更新成功')
    } else {
      throw new Error('更新失败')
    }
  } catch (error) {
    console.error('更新教师资料失败:', error)
    Message.error(error.response?.data?.message || '表单验证失败，请检查必填项')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.teacher-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-display {
  padding: 16px 0;
}

.form-actions {
  margin-top: 24px;
  text-align: right;
}

.unit-text {
  margin-left: 8px;
}

@media (max-width: 768px) {
  .teacher-card {
    margin: 0;
  }
}
</style>