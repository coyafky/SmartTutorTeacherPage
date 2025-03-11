import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import router from './router';
import '@arco-design/web-vue/dist/arco.css'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ArcoVue);

// 注册图标组件
app.component('IconUser', IconUser)
app.component('IconLock', IconLock)

app.mount('#app');
