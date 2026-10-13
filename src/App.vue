<template>
  <component :is="layout">
    <router-view></router-view>
  </component>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted, onUnmounted } from 'vue'
import BlankLayout from './layouts/BlankLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

const route = useRoute()
const layout = computed(() => {
  return route.meta.layout === 'blank'
    ? BlankLayout
    : DefaultLayout
})

let refreshInterval: number | null = null

onMounted(() => {
  // 每10分钟自动刷新页面，防止资源堆积导致页面卡顿
  refreshInterval = window.setInterval(() => {
    location.reload()
  }, 10 * 60 * 1000) // 10分钟 = 600秒 = 600000毫秒
})

onUnmounted(() => {
  // 组件卸载时清除定时器
  if (refreshInterval !== null) {
    window.clearInterval(refreshInterval)
  }
})
</script>
<style>
/* Only global styles if needed */
</style>
