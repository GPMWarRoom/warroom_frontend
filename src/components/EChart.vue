<template>
    <div ref="chartRef" :style="{ width: width, height: '100%' }" class="echart-container "></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

const props = defineProps<{
    options: EChartsOption
    width?: string
    height?: string
}>()

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 初始化圖表
const initChart = () => {
    if (chartRef.value) {
        chart = echarts.init(chartRef.value)
        chart.setOption(props.options)
    }
}

// 監聽 options 變化
watch(
    () => props.options,
    (newOptions) => {
        if (chart) {
            chart.setOption(newOptions)
        }
    },
    { deep: true }
)

// 監聽窗口大小變化
const handleResize = () => {
    if (chart) {
        chart.resize()
    }
}

onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
    if (chart) {
        chart.dispose()
    }
    window.removeEventListener('resize', handleResize)
})
</script>
<style scoped>
.echart-container {
    width: 100%;
    height: 100%;
}
</style>