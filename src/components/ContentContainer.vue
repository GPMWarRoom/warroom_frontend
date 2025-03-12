<template>
  <div class="content-container">
    <div class="content-wrapper h-100  ">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// 無需額外邏輯
</script>

<style scoped>
.content-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-wrapper {
}

/* 自定義滾動條 */
.content-wrapper::-webkit-scrollbar {
  width: 16px;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #4a4a4a;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
</style> 