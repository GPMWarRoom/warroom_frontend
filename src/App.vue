<template>
  <component :is="layout">
    <router-view></router-view>
  </component>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import BlankLayout from './layouts/BlankLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import { getVersion } from './api/index.ts'
const route = useRoute()
const layout = computed(() => {
  return route.meta.layout === 'blank'
    ? BlankLayout
    : DefaultLayout
})
onMounted(() => {
  getVersion().then((versions) => {
    console.log(versions)
  })
})
</script>
<style>
/* Only global styles if needed */
</style>
