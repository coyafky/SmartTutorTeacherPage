<template>
  <div class="students-container">
    <a-card :style="{ marginBottom: '16px' }">
      <template #title>学生管理</template>
      <template #extra>
        <a-button type="primary">
          <template #icon><icon-plus /></template>
          添加学生
        </a-button>
      </template>

      <a-table :data="students" :pagination="{ pageSize: 10 }" :bordered="false">
        <template #columns>
          <a-table-column title="姓名" data-index="name" />
          <a-table-column title="科目" data-index="subject" />
          <a-table-column title="学习进度" data-index="progress">
            <template #cell="{ record }">
              <a-progress :percent="record.progress" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="最近上课" data-index="lastClass" />
          <a-table-column title="操作">
            <template #cell>
              <a-space>
                <a-button type="text" size="small">查看详情</a-button>
                <a-button type="text" size="small">编辑</a-button>
                <a-popconfirm content="确定要删除这个学生吗？">
                  <a-button type="text" size="small" status="danger">删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <a-card title="学习记录">
      <a-tabs>
        <a-tab-pane key="1" title="课程记录">
          <a-list :data="lessonRecords">
            <template #item="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    {{ item.studentName }} - {{ item.subject }}
                  </template>
                  <template #description>
                    {{ item.date }} {{ item.content }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
        <a-tab-pane key="2" title="作业完成情况">
          <a-list :data="homeworkRecords">
            <template #item="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    {{ item.studentName }} - {{ item.subject }}
                  </template>
                  <template #description>
                    {{ item.date }} {{ item.status }}
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 模拟数据
const students = ref([
  {
    id: 1,
    name: '张三',
    subject: '数学',
    progress: 75,
    lastClass: '2024-01-18'
  },
  {
    id: 2,
    name: '李四',
    subject: '英语',
    progress: 60,
    lastClass: '2024-01-19'
  }
])

const lessonRecords = ref([
  {
    id: 1,
    studentName: '张三',
    subject: '数学',
    date: '2024-01-18',
    content: '完成了二次函数的学习'
  },
  {
    id: 2,
    studentName: '李四',
    subject: '英语',
    date: '2024-01-19',
    content: '复习了过去时态'
  }
])

const homeworkRecords = ref([
  {
    id: 1,
    studentName: '张三',
    subject: '数学',
    date: '2024-01-18',
    status: '已完成'
  },
  {
    id: 2,
    studentName: '李四',
    subject: '英语',
    date: '2024-01-19',
    status: '待完成'
  }
])
</script>

<style scoped>
.students-container {
  padding: 16px;
}

@media (max-width: 768px) {
  .students-container {
    padding: 8px;
  }
}
</style>