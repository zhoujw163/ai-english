import '@/assets/base.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores'
import 'dayjs/locale/zh-cn'
import registerDirectives from './directives'

const app = createApp(App)

registerDirectives(app)

app.use(pinia)
app.use(router)

app.mount('#app')
