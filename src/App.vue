<template>
  <component :is="layout">
    <router-view></router-view>
  </component>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import BlankLayout from './layouts/BlankLayout.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
const route = useRoute()
const layout = computed(() => {
  return route.meta.layout === 'blank'
    ? BlankLayout
    : DefaultLayout
})
</script>
<style>
/* Only global styles if needed */
</style>
