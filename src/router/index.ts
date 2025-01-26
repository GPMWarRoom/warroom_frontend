import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { HomeFilled, InfoFilled } from '@element-plus/icons-vue'
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首頁',
      icon: HomeFilled,
      showInMenu: true,
    }
  },
  {
    path: '/overview',
    name: 'Overview',
    component: () => import('../views/OverviewView.vue'),
    meta: {
      title: '概覽',
      icon: InfoFilled,
      showInMenu: true
    }
  },
  {
    path: '/AGVC',
    name: 'AGVC',
    component: () => import('../views/AGVC.vue'),
    meta: {
      title: '場域資訊',
      icon: InfoFilled,
      showInMenu: true
    }
  },
  {
    path: '/version',
    name: 'Version',
    component: () => import('../views/VersionView.vue'),
    meta: {
      title: '系統版本管理',
      icon: InfoFilled,
      showInMenu: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登入',
      showInMenu: false,
      layout: 'blank'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export const menuRoutes = routes.filter(route => route.meta && route.meta.showInMenu)
  .map(route => {
    return {
      path: route.path,
      name: route.name,
      icon: route.meta?.icon,
      title: route.meta?.title,
      showInMenu: route.meta?.showInMenu
    }
  });


export default router 