import { defineStore } from 'pinia';
import { authAPI } from '../utils/request';
import { Message } from '@arco-design/web-vue';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('user') || '{}'),
  }),

  getters: {
    // 获取用户信息
    getUser: (state) => state.userInfo,
    
    // 检查是否登录
    isLoggedIn: (state) => !!state.token,
    
    // 获取用户ID
    getUserId: (state) => state.userInfo?.id || '',
    
    // 获取教师ID
    getTutorId: (state) => state.userInfo?.tutorId || '',
    
    // 获取用户名
    getUsername: (state) => state.userInfo?.name || state.userInfo?.username,
    
    // 获取用户角色
    getRole: (state) => state.userInfo?.role,
    
    // 获取认证头信息
    getAuthHeader: (state) => ({ Authorization: `Bearer ${state.token}` }),
    
    // 检查用户信息是否完整
    isUserInfoComplete: (state) => {
      return !!state.token && !!state.userInfo && !!state.userInfo.tutorId;
    }
  },

  actions: {
    // 登录
    async login(data) {
      const res = await authAPI.login(data);
      this.setUserInfo(res.data);
      return res;
    },

    // 注册
    async register(data) {
      const res = await authAPI.register({ ...data, role: 'teacher' });
      this.setUserInfo(res.data);
      return res;
    },

    // 设置用户信息
    setUserInfo({ token, user }) {
      this.token = token;
      this.userInfo = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    // 登出
    logout() {
      this.token = '';
      this.userInfo = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // 检查登录状态，如果未登录则显示提示
    checkLoginStatus() {
      if (!this.isLoggedIn) {
        Message.error('请先登录');
        return false;
      }
      
      // 不检查教师ID是否存在，因为新注册用户可能没有教师信息
      return true;
    },
    
    // 更新用户信息的部分字段
    updateUserInfo(partialUserInfo) {
      this.userInfo = { ...this.userInfo, ...partialUserInfo };
      localStorage.setItem('user', JSON.stringify(this.userInfo));
    }
  },
});
