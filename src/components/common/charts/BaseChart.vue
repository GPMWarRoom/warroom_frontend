<template>
    <div ref="chartRef" :style="{ width: props.width || '100%', height: props.height || '100%' }"></div>
</template>
<script setup>
import { onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { uiStatsStore } from '../../../stores/UiStats.ts'
const props = defineProps({
    width: {
        type: String,
        default: '100%'
    },
    height: {
        type: String,
        default: '100%'
    },
    options: {
        type: Object,
        required: true
    }
})
const uiStats = uiStatsStore()
const emit = defineEmits(['chartReady'])
const chartRef = ref(null)
let chartInstance = null

// 初始化圖表
const initChart = () => {
    if (chartInstance) {
        chartInstance.dispose()
    }

    const chart = echarts.init(chartRef.value)
    chartInstance = chart

    if (props.options) {
        chart.setOption(props.options)
    }

    emit('chartReady', chart)
}

// 更新圖表
const updateChart = () => {
    if (chartInstance) {
        chartInstance.setOption(props.options, {
            notMerge: true,
            lazyUpdate: false
        })
    }
}

// 隱藏中的頁籤寬高為 0，這時 resize 會把圖表壓成一小團，之後再被拉回
const handleResize = () => {
    const el = chartRef.value
    if (!chartInstance || !el || el.clientWidth === 0 || el.clientHeight === 0) return
    chartInstance.resize({ animation: { duration: 0 } })
}



// 監聽 options 變化
watch(
    () => props.options,
    (newVal) => {
        nextTick(() => {
            updateChart()
        })
    },
    { deep: true }
)

watch(() => uiStats.isCollapse, (newVal) => {
    nextTick(() => {
        setTimeout(() => {
            handleResize();
        }, 1000);
    }),
        { immediate: true, deep: true }
})

watch(() => uiStats.agvcTabSelected, () => {
    nextTick(() => {
        requestAnimationFrame(() => handleResize())
    })
})

watch(() => uiStats.routeSelected, (newVal) => {
    nextTick(() => {
        setTimeout(() => {
            handleResize();
        }, 10);
    }),
        { immediate: true, deep: true }
})



// 生命週期鉤子
let resizeObserver = null

onMounted(() => {
    nextTick(() => {
        initChart()
        window.addEventListener('resize', handleResize)
        if (chartRef.value && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => handleResize())
            resizeObserver.observe(chartRef.value)
        }
    })
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
    if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
    }
    window.removeEventListener('resize', handleResize)
})

// 暴露方法給父組件
defineExpose({
    getChart: () => chartInstance,
    resize: handleResize
})
</script>
<style lang="scss" scoped></style>