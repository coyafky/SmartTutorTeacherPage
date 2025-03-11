import { defineStore } from 'pinia';
import { authAPI } from '../utils/request';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('user') || '{}'),
  }),

  getters: {
    getUser: (state) => state.userInfo,
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    async login(data) {
      const res = await authAPI.login(data);
      this.setUserInfo(res.data);
      return res;
    },

    async register(data) {
      const res = await authAPI.register({ ...data, role: 'teacher' });
      this.setUserInfo(res.data);
      return res;
    },

    setUserInfo({ token, user }) {
      this.token = token;
      this.userInfo = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    logout() {
      this.token = '';
      this.userInfo = {};
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
