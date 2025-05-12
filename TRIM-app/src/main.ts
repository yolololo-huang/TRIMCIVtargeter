import './assets/main.css'
import '@/utils/mathjax' // 必须在引入mathjax前引入mathjax的配置文件
import 'mathjax/es5/tex-svg' // 使用 tex-svg.js

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import $ from 'jquery'

// Make jQuery available globally
window.$ = $
window.jQuery = $

const app = createApp(App)

app.use(createPinia())

app.use(router)

app.mount('#app')
