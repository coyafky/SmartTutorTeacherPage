<template>
  <div class="messages-container">
    <!-- 页面标题 -->
    <h1 class="page-title">消息中心</h1>

    <div class="messages-content">
      <!-- 左侧：消息列表 -->
      <div class="message-list-section">
        <a-card :bordered="false" class="message-list-card">
          <div class="message-search">
            <a-input-search placeholder="搜索家长" allow-clear />
          </div>

          <div class="message-tabs">
            <a-tabs default-active-key="all">
              <a-tab-pane key="all" title="全部">
                <div class="contact-list">
                  <div
                    v-for="contact in contacts"
                    :key="contact.id"
                    class="contact-item"
                    :class="{ active: selectedContact && selectedContact.id === contact.id }"
                    @click="selectContact(contact)"
                  >
                    <div class="contact-avatar">
                      <a-badge :count="contact.unreadCount" :dot="contact.unreadCount > 0">
                        <a-avatar :size="46" :src="contact.avatar">{{
                          contact.name.charAt(0)
                        }}</a-avatar>
                      </a-badge>
                    </div>
                    <div class="contact-info">
                      <div class="contact-header">
                        <span class="contact-name">{{ contact.name }}</span>
                        <span class="contact-time">{{ contact.lastMessageTime }}</span>
                      </div>
                      <div class="contact-message">
                        <p class="message-preview" :class="{ unread: contact.unreadCount > 0 }">
                          {{ contact.lastMessage }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
              <a-tab-pane key="unread" title="未读">
                <div class="contact-list">
                  <div
                    v-for="contact in unreadContacts"
                    :key="contact.id"
                    class="contact-item"
                    :class="{ active: selectedContact && selectedContact.id === contact.id }"
                    @click="selectContact(contact)"
                  >
                    <div class="contact-avatar">
                      <a-badge :count="contact.unreadCount">
                        <a-avatar :size="46" :src="contact.avatar">{{
                          contact.name.charAt(0)
                        }}</a-avatar>
                      </a-badge>
                    </div>
                    <div class="contact-info">
                      <div class="contact-header">
                        <span class="contact-name">{{ contact.name }}</span>
                        <span class="contact-time">{{ contact.lastMessageTime }}</span>
                      </div>
                      <div class="contact-message">
                        <p class="message-preview unread">{{ contact.lastMessage }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </a-tab-pane>
            </a-tabs>
          </div>
        </a-card>
      </div>

      <!-- 右侧：聊天详情 -->
      <div class="chat-section">
        <a-card :bordered="false" class="chat-card" v-if="selectedContact">
          <template #title>
            <div class="chat-header">
              <div class="chat-contact-info">
                <span class="chat-contact-name">{{ selectedContact.name }}</span>
                <span class="chat-contact-status" v-if="selectedContact.online">
                  <a-badge status="success" text="在线" />
                </span>
                <span class="chat-contact-status" v-else>
                  <a-badge status="default" text="离线" />
                </span>
              </div>
              <div class="chat-actions">
                <a-button type="text" shape="circle">
                  <template #icon><icon-phone /></template>
                </a-button>
                <a-button type="text" shape="circle">
                  <template #icon><icon-video-camera /></template>
                </a-button>
                <a-button type="text" shape="circle">
                  <template #icon><icon-more /></template>
                </a-button>
              </div>
            </div>
          </template>

          <div class="chat-messages" ref="chatMessagesRef">
            <div class="chat-date-divider" v-if="selectedContact.messages && selectedContact.messages.length > 0">
              <span>{{ formatDate(selectedContact.messages[0]?.timestamp) }}</span>
            </div>

            <div
              v-for="(message, index) in selectedContact.messages"
              :key="index"
              class="message-item"
              :class="{
                'message-sent': message.sender === 'me',
                'message-received': message.sender !== 'me' && message.sender !== 'system',
                'message-system': message.sender === 'system',
              }"
            >
              <div
                class="message-avatar"
                v-if="message.sender !== 'me' && message.sender !== 'system'"
              >
                <a-avatar :size="36" :src="selectedContact.avatar">
                  {{ selectedContact.name.charAt(0) }}
                </a-avatar>
              </div>

              <div class="message-content">
                <div class="message-bubble">
                  <p>{{ message.content }}</p>
                </div>
                <div class="message-time" v-if="message.sender !== 'system'">
                  {{ formatMessageTime(message.timestamp) }}
                </div>
              </div>

              <div class="message-avatar" v-if="message.sender === 'me'">
                <a-avatar :size="36" :src="currentUser.avatar">
                  {{ currentUser.name.charAt(0) }}
                </a-avatar>
              </div>
            </div>

            <div class="typing-indicator" v-if="isTyping">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>

          <div class="chat-input">
            <div class="input-actions">
              <a-button type="text" shape="circle">
                <template #icon><icon-face-smile-fill /></template>
              </a-button>
              <a-button type="text" shape="circle">
                <template #icon><icon-image-close /></template>
              </a-button>
              <a-button type="text" shape="circle">
                <template #icon><icon-file /></template>
              </a-button>
            </div>

            <div class="input-field">
              <a-textarea
                v-model="messageInput"
                placeholder="输入消息..."
                :auto-size="{ minRows: 1, maxRows: 4 }"
                @keypress.enter.prevent="sendMessage"
              />
            </div>

            <div class="send-button">
              <a-button
                type="primary"
                shape="circle"
                :disabled="!messageInput.trim()"
                @click="sendMessage"
              >
                <template #icon><icon-send /></template>
              </a-button>
            </div>
          </div>
        </a-card>

        <div class="empty-chat" v-else>
          <a-empty description="选择一个联系人开始聊天">
            <template #image>
              <icon-message style="font-size: 64px; color: #c9cdd4" />
            </template>
          </a-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { IconMessage, IconFaceSmileFill, IconImageClose, IconFile, IconSend, IconPhone, IconVideoCamera, IconMore } from '@arco-design/web-vue/es/icon'
import { useUserStore } from '../stores/user'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 当前用户信息
const userStore = useUserStore()
const currentUser = {
  id: userStore.userId,
  name: userStore.username,
  avatar: userStore.avatar || '',
}

// 联系人列表
const contacts = ref([
  {
    id: 'parent1',
    name: '王先生',
    avatar: '',
    role: 'parent',
    lastMessage: '我想了解一下孩子最近的学习情况',
    lastMessageTime: '09:30',
    unreadCount: 2,
    online: true,
    messages: [
      {
        sender: 'system',
        content: '对话开始于2025年3月15日',
        timestamp: new Date('2025-03-15T08:00:00'),
      },
      {
        sender: 'parent1',
        content: '李老师您好，我是小明的爸爸',
        timestamp: new Date('2025-03-15T08:01:00'),
      },
      {
        sender: 'me',
        content: '王先生您好，很高兴认识您',
        timestamp: new Date('2025-03-15T08:02:00'),
      },
      {
        sender: 'parent1',
        content: '我想了解一下孩子最近的学习情况',
        timestamp: new Date('2025-03-18T09:30:00'),
      },
    ],
  },
  {
    id: 'parent2',
    name: '张女士',
    avatar: '',
    role: 'parent',
    lastMessage: '好的，谢谢老师，我会督促她完成作业的',
    lastMessageTime: '昨天',
    unreadCount: 0,
    online: false,
    messages: [
      {
        sender: 'system',
        content: '对话开始于2025年3月10日',
        timestamp: new Date('2025-03-10T10:00:00'),
      },
      {
        sender: 'me',
        content: '张女士您好，我是小红的数学老师',
        timestamp: new Date('2025-03-10T10:01:00'),
      },
      {
        sender: 'parent2',
        content: '您好老师，有什么事情吗？',
        timestamp: new Date('2025-03-10T10:05:00'),
      },
      {
        sender: 'me',
        content: '小红最近的作业完成情况不太好，希望您能督促她一下',
        timestamp: new Date('2025-03-17T16:30:00'),
      },
      {
        sender: 'parent2',
        content: '好的，谢谢老师，我会督促她完成作业的',
        timestamp: new Date('2025-03-17T16:45:00'),
      },
    ],
  },
  {
    id: 'parent3',
    name: '刘女士',
    avatar: '',
    role: 'parent',
    lastMessage: '老师，我们约个时间详细聊聊孩子的情况吧',
    lastMessageTime: '3天前',
    unreadCount: 0,
    online: false,
    messages: [
      {
        sender: 'system',
        content: '对话开始于2025年3月5日',
        timestamp: new Date('2025-03-05T14:00:00'),
      },
      {
        sender: 'parent3',
        content: '老师您好，我是小军的妈妈',
        timestamp: new Date('2025-03-05T14:01:00'),
      },
      {
        sender: 'me',
        content: '刘女士您好，有什么可以帮到您的吗？',
        timestamp: new Date('2025-03-05T14:10:00'),
      },
      {
        sender: 'parent3',
        content: '老师，我们约个时间详细聊聊孩子的情况吧',
        timestamp: new Date('2025-03-15T11:20:00'),
      },
    ],
  },
])

// 未读消息联系人
const unreadContacts = computed(() => {
  return contacts.value.filter((contact) => contact.unreadCount > 0)
})

// 选中的联系人
const selectedContact = ref(null)
const messageInput = ref('')
const isTyping = ref(false)
const chatMessagesRef = ref(null)

// 选择联系人
const selectContact = (contact) => {
  selectedContact.value = contact
  // 标记为已读
  contact.unreadCount = 0
  nextTick(() => {
    scrollToBottom()
  })
}

// 发送消息
const sendMessage = () => {
  if (!messageInput.value.trim()) return

  const now = new Date()
  
  // 添加新消息
  selectedContact.value.messages.push({
    sender: 'me',
    content: messageInput.value,
    timestamp: now,
  })

  // 更新最后一条消息
  selectedContact.value.lastMessage = messageInput.value
  selectedContact.value.lastMessageTime = formatMessageTime(now)

  // 清空输入框
  messageInput.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
    // 模拟对方回复
    setTimeout(() => {
      simulateReply()
    }, 3000)
  })
}

// 模拟回复
const simulateReply = () => {
  if (!selectedContact.value) return

  // 显示对方正在输入
  isTyping.value = true

  setTimeout(() => {
    isTyping.value = false
    
    const now = new Date()
    const replyMessages = [
      '好的，我明白了',
      '谢谢您的关心',
      '我会尽快处理这个问题',
      '孩子最近在家的表现还不错',
      '我们需要多沟通一下孩子的学习情况',
      '老师，您对孩子有什么建议吗？'
    ]
    
    const randomReply = replyMessages[Math.floor(Math.random() * replyMessages.length)]
    
    // 添加回复消息
    selectedContact.value.messages.push({
      sender: selectedContact.value.id,
      content: randomReply,
      timestamp: now,
    })

    // 更新最后一条消息
    selectedContact.value.lastMessage = randomReply
    selectedContact.value.lastMessageTime = formatMessageTime(now)

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }, 2000)
}

// 滚动到底部
const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const date = new Date(timestamp)
  
  if (date.toDateString() === now.toDateString()) {
    return '今天'
  } else if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'M月d日', { locale: zhCN })
  } else {
    return format(date, 'yyyy年M月d日', { locale: zhCN })
  }
}

// 格式化消息时间
const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const date = new Date(timestamp)
  
  if (date.toDateString() === now.toDateString()) {
    return format(date, 'HH:mm')
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    return format(date, 'EEEE', { locale: zhCN })
  } else {
    return format(date, 'yyyy/MM/dd')
  }
}

onMounted(() => {
  // 默认选择第一个联系人
  if (contacts.value.length > 0) {
    selectContact(contacts.value[0])
  }
})
</script>

<style scoped>
.messages-container {
  padding: 24px;
}

.page-title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 500;
  color: var(--color-text-1);
}

.messages-content {
  display: flex;
  gap: 24px;
  height: calc(100vh - 150px);
}

.message-list-section {
  width: 320px;
  flex-shrink: 0;
}

.message-list-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-search {
  margin-bottom: 16px;
}

.message-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.contact-list {
  overflow-y: auto;
  flex: 1;
  height: calc(100vh - 250px);
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.contact-item:hover {
  background-color: var(--color-fill-2);
}

.contact-item.active {
  background-color: var(--color-fill-2);
}

.contact-avatar {
  margin-right: 12px;
}

.contact-info {
  flex: 1;
  overflow: hidden;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.contact-name {
  font-weight: 500;
  color: var(--color-text-1);
}

.contact-time {
  font-size: 12px;
  color: var(--color-text-3);
}

.message-preview {
  font-size: 13px;
  color: var(--color-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.message-preview.unread {
  color: var(--color-text-1);
  font-weight: 500;
}

.chat-section {
  flex: 1;
  min-width: 0;
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-contact-name {
  font-weight: 500;
  margin-right: 8px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: var(--color-fill-1);
  border-radius: 4px;
  height: calc(100vh - 280px);
}

.chat-date-divider {
  text-align: center;
  margin: 16px 0;
  position: relative;
}

.chat-date-divider span {
  background-color: var(--color-fill-1);
  padding: 0 12px;
  font-size: 12px;
  color: var(--color-text-3);
  position: relative;
  z-index: 1;
}

.chat-date-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border-2);
  z-index: 0;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
}

.message-sent {
  flex-direction: row-reverse;
}

.message-system {
  justify-content: center;
}

.message-avatar {
  margin: 0 8px;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 10px 16px;
  border-radius: 18px;
  position: relative;
}

.message-sent .message-bubble {
  background-color: var(--color-primary-light-4);
  border-top-right-radius: 4px;
}

.message-received .message-bubble {
  background-color: #fff;
  border-top-left-radius: 4px;
}

.message-system .message-bubble {
  background-color: transparent;
  padding: 4px 12px;
}

.message-bubble p {
  margin: 0;
  word-break: break-word;
}

.message-sent .message-bubble p {
  color: var(--color-primary-6);
}

.message-system .message-bubble p {
  font-size: 12px;
  color: var(--color-text-3);
}

.message-time {
  font-size: 12px;
  color: var(--color-text-3);
  margin-top: 4px;
  text-align: right;
}

.message-sent .message-time {
  text-align: right;
}

.message-received .message-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  padding: 8px 16px;
  background-color: #fff;
  border-radius: 18px;
  width: fit-content;
  margin-bottom: 16px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-text-3);
  margin: 0 2px;
  animation: typing 1.5s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
  }
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 16px 0 0;
  border-top: 1px solid var(--color-border-2);
  margin-top: 16px;
}

.input-actions {
  display: flex;
  margin-right: 8px;
}

.input-field {
  flex: 1;
}

.send-button {
  margin-left: 8px;
}

.empty-chat {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
