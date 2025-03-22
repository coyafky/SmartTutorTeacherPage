import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from './user'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useMessageStore = defineStore('message', () => {
  // 状态
  const conversations = ref([])
  const currentConversation = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const socket = ref(null)
  const isConnected = ref(false)
  const typingUsers = ref({}) // 正在输入的用户 { conversationId: { userId: timestamp } }
  const notifications = ref([]) // 消息通知

  // 用户存储
  const userStore = useUserStore()

  // 计算属性
  const unreadCount = computed(() => {
    return conversations.value.reduce((total, conv) => total + (conv.unreadCount || 0), 0)
  })

  const unreadConversations = computed(() => {
    return conversations.value.filter(conv => (conv.unreadCount || 0) > 0)
  })

  // 初始化 Socket.IO 连接
  const initializeSocket = () => {
    if (socket.value) return

    socket.value = io(API_URL, {
      auth: {
        token: userStore.token
      }
    })

    // 连接事件
    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('已连接到消息服务器')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('与消息服务器断开连接')
    })

    // 新消息事件
    socket.value.on('new_message', (message) => {
      // 添加新消息到对话
      addMessageToConversation(message)
      
      // 如果不是当前对话，增加未读计数
      if (!currentConversation.value || currentConversation.value._id !== message.conversationId) {
        const conversation = conversations.value.find(c => c._id === message.conversationId)
        if (conversation) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1
          // 添加通知
          addNotification({
            type: 'message',
            title: `来自 ${conversation.parentName} 的新消息`,
            content: message.content,
            time: new Date(),
            conversationId: conversation._id
          })
        }
      } else {
        // 如果是当前对话，标记为已读
        markMessagesAsRead([message._id])
      }
    })

    // 消息已读事件
    socket.value.on('messages_read', ({ messageIds, conversationId, userId }) => {
      // 更新消息已读状态
      if (currentConversation.value && currentConversation.value._id === conversationId) {
        currentConversation.value.messages.forEach(msg => {
          if (messageIds.includes(msg._id) && msg.senderId === userStore.userId) {
            msg.isRead = true
          }
        })
      }
    })

    // 用户正在输入事件
    socket.value.on('user_typing', ({ userId, conversationId }) => {
      if (!typingUsers.value[conversationId]) {
        typingUsers.value[conversationId] = {}
      }
      typingUsers.value[conversationId][userId] = Date.now()
      
      // 3秒后自动清除输入状态
      setTimeout(() => {
        if (typingUsers.value[conversationId] && typingUsers.value[conversationId][userId]) {
          const now = Date.now()
          if (now - typingUsers.value[conversationId][userId] >= 3000) {
            delete typingUsers.value[conversationId][userId]
            if (Object.keys(typingUsers.value[conversationId]).length === 0) {
              delete typingUsers.value[conversationId]
            }
          }
        }
      }, 3000)
    })
  }

  // 断开 Socket.IO 连接
  const disconnectSocket = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  // 获取教师的所有对话
  const fetchConversations = async () => {
    if (!userStore.token) return

    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      })
      conversations.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || '获取对话列表失败'
      console.error('获取对话列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 获取对话详情
  const fetchConversation = async (conversationId) => {
    if (!userStore.token || !conversationId) return

    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get(`${API_URL}/api/messages/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      })
      
      const conversation = response.data.data
      
      // 更新对话列表中的对话
      const index = conversations.value.findIndex(c => c._id === conversationId)
      if (index !== -1) {
        conversations.value[index] = conversation
      } else {
        conversations.value.push(conversation)
      }
      
      currentConversation.value = conversation
      
      // 标记消息为已读
      const unreadMessages = conversation.messages.filter(
        msg => !msg.isRead && msg.receiverId === userStore.userId
      )
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id)
        markMessagesAsRead(messageIds)
      }
      
      return conversation
    } catch (err) {
      error.value = err.response?.data?.message || '获取对话详情失败'
      console.error('获取对话详情失败:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // 发送消息
  const sendMessage = async (content, conversationId, messageType = 'text') => {
    if (!userStore.token || !conversationId || !content) return null

    try {
      // 通过 Socket.IO 发送消息
      if (socket.value && isConnected.value) {
        socket.value.emit('send_message', {
          conversationId,
          content,
          messageType
        })
        
        // 乐观更新 UI
        const tempId = `temp-${Date.now()}`
        const tempMessage = {
          _id: tempId,
          conversationId,
          senderId: userStore.userId,
          receiverId: currentConversation.value.participants.find(p => p !== userStore.userId),
          content,
          messageType,
          createdAt: new Date(),
          isRead: false,
          isSending: true
        }
        
        addMessageToConversation(tempMessage)
        
        return tempMessage
      } else {
        // 如果 Socket 未连接，使用 HTTP API 发送
        const response = await axios.post(
          `${API_URL}/api/messages`,
          { conversationId, content, messageType },
          {
            headers: {
              Authorization: `Bearer ${userStore.token}`
            }
          }
        )
        
        const message = response.data.data
        addMessageToConversation(message)
        return message
      }
    } catch (err) {
      error.value = err.response?.data?.message || '发送消息失败'
      console.error('发送消息失败:', err)
      
      // 更新失败状态
      if (currentConversation.value) {
        const failedMessageIndex = currentConversation.value.messages.findIndex(
          msg => msg.isSending
        )
        
        if (failedMessageIndex !== -1) {
          currentConversation.value.messages[failedMessageIndex].isFailed = true
          currentConversation.value.messages[failedMessageIndex].isSending = false
        }
      }
      
      return null
    }
  }

  // 重新发送失败的消息
  const resendMessage = async (messageId) => {
    if (!currentConversation.value) return null
    
    const messageIndex = currentConversation.value.messages.findIndex(msg => msg._id === messageId)
    if (messageIndex === -1) return null
    
    const message = currentConversation.value.messages[messageIndex]
    
    // 更新状态
    message.isFailed = false
    message.isSending = true
    
    return sendMessage(message.content, message.conversationId, message.messageType)
  }

  // 标记消息为已读
  const markMessagesAsRead = async (messageIds) => {
    if (!userStore.token || !messageIds || messageIds.length === 0) return

    try {
      // 通过 Socket.IO 标记已读
      if (socket.value && isConnected.value) {
        socket.value.emit('mark_read', { messageIds })
      } else {
        // 如果 Socket 未连接，使用 HTTP API 标记已读
        await axios.put(
          `${API_URL}/api/messages/read`,
          { messageIds },
          {
            headers: {
              Authorization: `Bearer ${userStore.token}`
            }
          }
        )
      }
      
      // 更新本地消息状态
      if (currentConversation.value) {
        currentConversation.value.messages.forEach(msg => {
          if (messageIds.includes(msg._id)) {
            msg.isRead = true
          }
        })
        
        // 更新未读计数
        const conversationIndex = conversations.value.findIndex(
          c => c._id === currentConversation.value._id
        )
        
        if (conversationIndex !== -1) {
          conversations.value[conversationIndex].unreadCount = 0
        }
      }
    } catch (err) {
      console.error('标记消息已读失败:', err)
    }
  }

  // 发送正在输入状态
  const sendTypingStatus = (conversationId) => {
    if (!socket.value || !isConnected.value || !conversationId) return
    
    socket.value.emit('typing', { conversationId })
  }

  // 添加消息到对话
  const addMessageToConversation = (message) => {
    // 查找对话
    const conversationIndex = conversations.value.findIndex(c => c._id === message.conversationId)
    
    if (conversationIndex !== -1) {
      // 更新对话的最后一条消息
      conversations.value[conversationIndex].lastMessage = message.content
      conversations.value[conversationIndex].lastMessageTime = message.createdAt
      
      // 如果是当前对话，添加消息
      if (currentConversation.value && currentConversation.value._id === message.conversationId) {
        // 检查消息是否已存在
        const existingIndex = currentConversation.value.messages.findIndex(
          msg => msg._id === message._id || (msg._id.startsWith('temp-') && msg.content === message.content)
        )
        
        if (existingIndex !== -1) {
          // 替换临时消息
          currentConversation.value.messages.splice(existingIndex, 1, message)
        } else {
          // 添加新消息
          currentConversation.value.messages.push(message)
        }
      }
      
      // 将对话移到顶部
      const conversation = conversations.value.splice(conversationIndex, 1)[0]
      conversations.value.unshift(conversation)
    }
  }

  // 添加通知
  const addNotification = (notification) => {
    notifications.value.unshift(notification)
    
    // 限制通知数量
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  // 清除通知
  const clearNotifications = () => {
    notifications.value = []
  }

  // 清除特定对话的通知
  const clearConversationNotifications = (conversationId) => {
    notifications.value = notifications.value.filter(n => n.conversationId !== conversationId)
  }

  // 检查用户是否正在输入
  const isUserTyping = (conversationId, userId) => {
    return typingUsers.value[conversationId] && typingUsers.value[conversationId][userId]
  }

  return {
    conversations,
    currentConversation,
    isLoading,
    error,
    isConnected,
    typingUsers,
    notifications,
    unreadCount,
    unreadConversations,
    initializeSocket,
    disconnectSocket,
    fetchConversations,
    fetchConversation,
    sendMessage,
    resendMessage,
    markMessagesAsRead,
    sendTypingStatus,
    addNotification,
    clearNotifications,
    clearConversationNotifications,
    isUserTyping
  }
})
