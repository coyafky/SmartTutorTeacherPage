<template>
  <div class="schedule-container">
    <a-card :style="{ marginBottom: '16px' }">
      <template #title>课程安排</template>
      <template #extra>
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          添加课程
        </a-button>
      </template>

      <a-calendar>
        <template #cell="{ date }">
          <template v-if="hasSchedule(date)">
            <div class="schedule-item" v-for="schedule in getSchedules(date)" :key="schedule.id">
              <a-tag :color="schedule.color">{{ schedule.time }}</a-tag>
              <span>{{ schedule.studentName }} - {{ schedule.subject }}</span>
            </div>
          </template>
        </template>
      </a-calendar>
    </a-card>

    <a-card title="近期课程">
      <a-list :data="upcomingSchedules">
        <template #item="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.studentName }} - {{ item.subject }}
              </template>
              <template #description>
                {{ item.date }} {{ item.time }}
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-space>
                <a-button type="text" size="small">编辑</a-button>
                <a-popconfirm content="确定要取消这节课吗？">
                  <a-button type="text" size="small" status="danger">取消</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟数据
const schedules = ref([
  {
    id: 1,
    studentName: '张三',
    subject: '数学',
    date: '2024-01-20',
    time: '14:00-15:30',
    color: 'blue'
  },
  {
    id: 2,
    studentName: '李四',
    subject: '英语',
    date: '2024-01-21',
    time: '16:00-17:30',
    color: 'green'
  }
])

const upcomingSchedules = ref(schedules.value)

const hasSchedule = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return schedules.value.some(schedule => schedule.date === dateStr)
}

const getSchedules = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  return schedules.value.filter(schedule => schedule.date === dateStr)
}
</script>

<style scoped>
.schedule-container {
  padding: 16px;
}

.schedule-item {
  margin: 4px 0;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .schedule-container {
    padding: 8px;
  }
}
</style>