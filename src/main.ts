import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import router from './router'
import 'element-plus/dist/index.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.css'

import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'ol/ol.css';

// 創建 Pinia store
const pinia = createPinia()

// 創建 Vue 應用
const app = createApp(App)

// 使用插件
app.use(router)
app.use(pinia)
app.use(ElementPlus)

// 註冊所有圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 掛載應用
app.mount('#app')
