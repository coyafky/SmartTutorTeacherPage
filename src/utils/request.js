import axios from 'axios';
import { Message } from '@arco-design/web-vue';

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 5000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    Message.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  register: (data) => request.post('/auth/register', data),
  login: (data) => request.post('/auth/login', data),
};

export default request;
