<template>
  <div
    class="simple-content-container"
    @mouseenter="showContentData = true"
    @mouseleave="showContentData = true"
  >
    <el-tooltip :content="class1HeaderNumber" placement="left-start">
      <template #content>
        <slot name="content-data"></slot>
      </template>
      <div>
        <div
          class="class1-item-bar"
          v-for="i in class1HeaderNumber"
          :key="i"
          :style="{ backgroundColor: currentActiveValue === i-1 ? 'orange' : '#5c5c5c' }"
        ></div>
      </div>
    </el-tooltip>
    <!-- <div class="content-data-container" v-if="showContentData">
      <slot name="content-data"></slot>
    </div>-->
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({
  class1HeaderNumber: {
    type: Number,
    default: 0
  },
  currentActiveValue: {
    type: Number,
    default: -1
  }
})

const showContentData = ref(true);
</script>

<style lang="scss" scoped>
.simple-content-container {
  margin: 10px 10px;
  .class1-item-bar {
    height: 2px;
    width: 20px;
    background-color: #5c5c5c;
    margin: 10px 0;
  }
  .content-data-container {
    margin: 10px 0;
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>