<template>
    <div ref="chartRef" :style="{ width: props.width || '100%', height: props.height || '100%' }"></div>
</template>
<script setup>
import { onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { uiStatsStore } from '../../../stores/UiStats.ts'
import { debounce } from '../../../utils/debounce'
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
        chartInstance.setOption(props.options)
    }
}

// 調整圖表大小
const handleResize = () => {

    const debouncedResize = debounce(() => {
        if (chartInstance) {
            chartInstance.resize();
        }
    }, 100);
    debouncedResize()
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

watch(() => uiStats.agvcTabSelected, (newVal) => {
    nextTick(() => {
        setTimeout(() => {
            handleResize();
        }, 10);
    }),
        { immediate: true, deep: true }
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
onMounted(() => {
    initChart()
    window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
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