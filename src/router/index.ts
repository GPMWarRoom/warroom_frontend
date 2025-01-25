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
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: '關於',
      icon: InfoFilled,
      showInMenu: true
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