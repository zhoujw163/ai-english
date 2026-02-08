import '@/assets/base.css';

import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import pinia from './stores';
import 'dayjs/locale/zh-cn';

const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');
