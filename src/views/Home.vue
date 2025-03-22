<template>
  <div class="home-container">
    <a-card class="welcome-card" :style="{ marginBottom: '16px' }">
      <div class="welcome-content">
        <div>
          <h2>晚上好，{{ userStore.username }}老师！</h2>
          <p>智能家教推荐系统助您提供优质教学服务</p>
        </div>
        <div class="logo">
          <img src="../assets/logo.png" alt="教学场景" />
        </div>
      </div>
    </a-card>

    <div class="section-title">快捷功能</div>
    <div class="quick-functions">
      <router-link to="/profile" class="function-item">
        <div class="icon-container">
          <icon-user class="function-icon" />
        </div>
        <div class="function-name">个人资料</div>
      </router-link>
      
      <router-link to="/teacher-post" class="function-item">
        <div class="icon-container">
          <icon-edit class="function-icon" />
        </div>
        <div class="function-name">课程设置</div>
      </router-link>
      
      <router-link to="/schedule" class="function-item">
        <div class="icon-container">
          <icon-calendar class="function-icon" />
        </div>
        <div class="function-name">课程安排</div>
      </router-link>
      
      <router-link to="/messages" class="function-item">
        <div class="icon-container">
          <icon-message class="function-icon" />
        </div>
        <div class="function-name">消息中心</div>
      </router-link>
      
      <router-link to="/teaching-report" class="function-item">
        <div class="icon-container">
          <icon-file class="function-icon" />
        </div>
        <div class="function-name">教学报告</div>
      </router-link>
      
      <router-link to="/settings" class="function-item">
        <div class="icon-container">
          <icon-settings class="function-icon" />
        </div>
        <div class="function-name">系统设置</div>
      </router-link>
    </div>

    <div class="section-title">近期课程
      <a-button type="text" class="refresh-btn" @click="loadRecentCourses">
        <icon-refresh /> 刷新
      </a-button>
      <router-link to="/schedule" class="more-link">查看更多</router-link>
    </div>
    
    <a-row :gutter="16">
      <a-col :span="24" :md="8" v-for="course in recentCourses" :key="course.id">
        <a-card class="course-card" :style="{ marginBottom: '16px' }">
          <div class="student-info">
            <div class="student-name">{{ course.studentName }}</div>
            <div class="course-subject">{{ course.subject }}</div>
          </div>
          <div class="course-time">
            <icon-calendar /> {{ course.date }}
            <icon-clock-circle /> {{ course.time }}
          </div>
          <div class="course-actions">
            <a-button type="primary" size="small" @click="viewCourseDetail(course.id)">查看详情</a-button>
            <a-button size="small" @click="startCourse(course.id)">开始上课</a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :span="24" :md="12">
        <a-card title="预约请求" :style="{ marginBottom: '16px' }">
          <a-list>
            <a-list-item v-for="request in appointmentRequests" :key="request.id">
              <a-list-item-meta>
                <template #title>
                  {{ request.studentName }} - {{ request.subject }}
                </template>
                <template #description>
                  希望预约时间: {{ request.preferredTime }}
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="primary" size="small" @click="acceptAppointment(request.id)">接受</a-button>
                <a-button size="small" @click="rejectAppointment(request.id)">拒绝</a-button>
              </template>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="24" :md="12">
        <a-card title="重要通知" :style="{ marginBottom: '16px' }">
          <a-list>
            <a-list-item v-for="notice in notices" :key="notice.id">
              <a-list-item-meta>
                <template #title>{{ notice.title }}</template>
                <template #description>{{ notice.content }}</template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { Message } from '@arco-design/web-vue'
import axios from 'axios'
import {
  IconUser,
  IconEdit,
  IconCalendar,
  IconMessage,
  IconFile,
  IconSettings,
  IconRefresh,
  IconClockCircle
} from '@arco-design/web-vue/es/icon'

const userStore = useUserStore()
const loading = ref(false)

// 当前日期
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

// 近期课程数据
const recentCourses = ref([
  {
    id: 1,
    studentName: '张同学',
    subject: '数学',
    date: '2025-03-19',
    time: '14:00-15:30'
  },
  {
    id: 2,
    studentName: '李同学',
    subject: '英语',
    date: '2025-03-20',
    time: '16:00-17:30'
  },
  {
    id: 3,
    studentName: '王同学',
    subject: '物理',
    date: '2025-03-21',
    time: '09:00-10:30'
  }
])

// 预约请求数据
const appointmentRequests = ref([
  {
    id: 1,
    studentName: '赵同学',
    subject: '数学',
    preferredTime: '周三下午 15:00-16:30'
  },
  {
    id: 2,
    studentName: '钱同学',
    subject: '物理',
    preferredTime: '周六上午 10:00-11:30'
  }
])

// 通知数据
const notices = ref([
  {
    id: 1,
    title: '系统更新通知',
    content: '系统将于本周六凌晨2点进行例行维护更新'
  },
  {
    id: 2,
    title: '课程提醒',
    content: '请及时确认下周课程安排'
  },
  {
    id: 3,
    title: '新功能上线',
    content: '教学报告功能已上线，欢迎使用'
  }
])

// 加载近期课程数据
const loadRecentCourses = async () => {
  loading.value = true
  try {
    if (!userStore.checkLoginStatus()) return
    
    // 获取教师ID
    const tutorId = userStore.getTutorId
    if (!tutorId) {
      // 如果没有教师ID，可能是新注册用户
      Message.info('您还没有课程数据，请先创建教师资料')
      loading.value = false
      return
    }
    
    // 这里应该调用实际的API
    // const response = await axios.get(`http://localhost:3000/api/tutors/${tutorId}/courses`, {
    //   headers: userStore.getAuthHeader
    // })
    
    // if (response.data.status === 'success') {
    //   recentCourses.value = response.data.data.courses
    // }
    
    // 模拟API调用成功
    Message.success('课程数据已刷新')
  } catch (error) {
    console.error('加载课程数据失败:', error)
    Message.error('加载课程数据失败')
  } finally {
    loading.value = false
  }
}

// 查看课程详情
const viewCourseDetail = (courseId) => {
  // 跳转到课程详情页面
  console.log('查看课程详情:', courseId)
}

// 开始上课
const startCourse = (courseId) => {
  // 跳转到上课页面或启动上课模式
  console.log('开始上课:', courseId)
  Message.success('课程已开始')
}

// 接受预约
const acceptAppointment = async (requestId) => {
  try {
    // 这里应该调用实际的API
    // const response = await axios.post(`http://localhost:3000/api/appointments/${requestId}/accept`)
    
    // 模拟API调用成功
    Message.success('已接受预约')
    // 从列表中移除该请求
    appointmentRequests.value = appointmentRequests.value.filter(req => req.id !== requestId)
  } catch (error) {
    console.error('接受预约失败:', error)
    Message.error('接受预约失败')
  }
}

// 拒绝预约
const rejectAppointment = async (requestId) => {
  try {
    // 这里应该调用实际的API
    // const response = await axios.post(`http://localhost:3000/api/appointments/${requestId}/reject`)
    
    // 模拟API调用成功
    Message.success('已拒绝预约')
    // 从列表中移除该请求
    appointmentRequests.value = appointmentRequests.value.filter(req => req.id !== requestId)
  } catch (error) {
    console.error('拒绝预约失败:', error)
    Message.error('拒绝预约失败')
  }
}

onMounted(async () => {
  // 加载数据
  loadRecentCourses()
})
</script>

<style scoped>
.home-container {
  padding: 16px;
}

.welcome-card {
  background-color: #1e88e5;
  color: white;
  margin-bottom: 20px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content h2 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 24px;
  color: white;
}

.welcome-content p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo img {
  max-width: 100%;
  max-height: 100%;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh-btn {
  margin-left: auto;
  margin-right: 8px;
}

.more-link {
  font-size: 14px;
  color: #1e88e5;
  text-decoration: none;
}

.quick-functions {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
  padding: 12px;
  transition: all 0.3s;
}

.function-item:hover {
  transform: translateY(-3px);
}

.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.function-icon {
  font-size: 24px;
  color: #1e88e5;
}

.function-name {
  font-size: 14px;
  text-align: center;
}

.course-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.course-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.student-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.student-name {
  font-weight: bold;
  font-size: 16px;
}

.course-subject {
  color: #1e88e5;
  font-weight: bold;
}

.course-time {
  color: #666;
  margin-bottom: 12px;
  display: flex;
  gap: 16px;
}

.course-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .home-container {
    padding: 8px;
  }
  
  .quick-functions {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>