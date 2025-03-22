import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      showNav: false,
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      showNav: false,
      requiresAuth: false,
    },
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      showNav: true,
      requiresAuth: true,
    },
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('../views/Students.vue'),
    meta: {
      showNav: true,
      requiresAuth: true,
    },
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('../views/Schedule.vue'),
    meta: {
      showNav: true,
      requiresAuth: true,
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      showNav: true,
      requiresAuth: true,
    },
  },
  {
    path: '/teacherpost',
    name: 'Post',
    component: () => import('../views/TeacherPost.vue'),
    meta: {
      showNav: true,
      requiresAuth: true,
    },
  },
  {
    path: '/messages',
    name: 'MessageCenter',
    component: () => import('../views/MessageCenter.vue'),
    meta: {
      showNav: true,
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 需要认证且未登录
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login');
    return;
  }

  // 已登录访问登录页
  if (to.path === '/login' && userStore.token) {
    next('/home');
    return;
  }

  next();
});

export default router;
