<template>
  <div class="home-container">
    <a-card class="welcome-card" :style="{ marginBottom: '16px' }">
      <template #title>欢迎回来，{{ userStore.username }}</template>
      <p>今天是 {{ currentDate }}，祝您教学愉快！</p>
    </a-card>

    <a-row :gutter="16">
      <a-col :span="24" :md="12">
        <a-card title="近期课程" :style="{ marginBottom: '16px' }">
          <template #extra>
            <router-link to="/schedule">查看全部</router-link>
          </template>
          <a-list>
            <a-list-item v-for="course in recentCourses" :key="course.id">
              <a-list-item-meta>
                <template #title>
                  {{ course.studentName }} - {{ course.subject }}
                </template>
                <template #description>
                  {{ course.date }} {{ course.time }}
                </template>
              </a-list-item-meta>
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

const userStore = useUserStore()

// 当前日期
const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
})

// 模拟数据
const recentCourses = ref([
  {
    id: 1,
    studentName: '张三',
    subject: '数学',
    date: '2024-01-20',
    time: '14:00-15:30'
  },
  {
    id: 2,
    studentName: '李四',
    subject: '英语',
    date: '2024-01-21',
    time: '16:00-17:30'
  }
])

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
  }
])

onMounted(async () => {
  // TODO: 从API获取实际数据
})
</script>

<style scoped>
.home-container {
  padding: 16px;
}

.welcome-card {
  background-color: #f0f7ff;
}

@media (max-width: 768px) {
  .home-container {
    padding: 8px;
  }
}
</style>