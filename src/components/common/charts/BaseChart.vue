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
    applyChartTheme()

    emit('chartReady', chart)
}

const chartPalette = () => {
    const dark = uiStats.theme !== 'light'
    return dark
        ? { text: '#eef2ff', axis: 'rgba(200,215,255,0.35)', split: 'rgba(255,255,255,0.08)', tipBg: 'rgba(20,27,52,0.92)', tipText: '#eef2ff', border: 'rgba(255,255,255,0.14)' }
        : { text: '#141a33', axis: 'rgba(30,40,90,0.35)', split: 'rgba(30,40,90,0.08)', tipBg: 'rgba(255,255,255,0.95)', tipText: '#141a33', border: 'rgba(30,40,90,0.14)' }
}

const paintAxis = (axis, palette) => {
    if (!axis) return axis
    const list = Array.isArray(axis) ? axis : [axis]
    return list.map((item) => ({
        ...item,
        axisLabel: { ...(item.axisLabel || {}), color: palette.text },
        nameTextStyle: { ...(item.nameTextStyle || {}), color: palette.text },
        axisLine: { ...(item.axisLine || {}), lineStyle: { ...((item.axisLine && item.axisLine.lineStyle) || {}), color: palette.axis } },
        splitLine: { ...(item.splitLine || {}), lineStyle: { ...((item.splitLine && item.splitLine.lineStyle) || {}), color: palette.split } }
    }))
}

const applyChartTheme = () => {
    if (!chartInstance) return
    const palette = chartPalette()
    const current = chartInstance.getOption()
    chartInstance.setOption({
        backgroundColor: 'transparent',
        textStyle: { color: palette.text },
        title: { textStyle: { color: palette.text } },
        legend: { textStyle: { color: palette.text } },
        tooltip: { backgroundColor: palette.tipBg, borderColor: palette.border, textStyle: { color: palette.tipText } },
        xAxis: paintAxis(current.xAxis, palette),
        yAxis: paintAxis(current.yAxis, palette)
    })
}

// 更新圖表
const updateChart = () => {
    if (chartInstance) {
        chartInstance.setOption(props.options, {
            notMerge: true,
            lazyUpdate: false
        })
        applyChartTheme()
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

watch(() => uiStats.theme, () => {
    nextTick(() => applyChartTheme())
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