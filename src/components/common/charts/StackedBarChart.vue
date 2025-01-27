<template>
    <BaseChart ref="chartRef" :options="chartOptions" :width="width" :height="height" />
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseChart from './BaseChart.vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'

const props = defineProps({
    title: {
        type: String,
    },
    // 數據格式為: [{ name: '系列1', data: [1,2,3] }, { name: '系列2', data: [4,5,6] }]
    series: {
        type: Array,
        required: true
    },
    categories: {
        type: Array,
        default: () => []
    },
    xAxisName: {
        type: String,
        default: '類別'
    },
    yAxisName: {
        type: String,
        default: '數值'
    },
    barWidth: {
        type: Number,
        default: 20
    },
    // 堆疊圖的顏色配置
    colors: {
        type: Array,
        default: () => ['#83bff6', '#188df0', '#64d3ff', '#2f4554', '#61a0a8']
    },
    useGradient: {
        type: Boolean,
        default: true
    }
})

const chartOptions = computed(() => {
    const options = new globalChartOptions()
    options.xAxis.name = props.xAxisName
    options.xAxis.type = 'category'
    options.xAxis.data = props.categories
    options.yAxis.name = props.yAxisName
    options.title.text = props.title

    // 生成堆疊圖的系列配置
    options.series = props.series.map((item, index) => ({
        name: item.name,
        type: 'bar',
        stack: 'total',
        data: item.data,
        barWidth: props.barWidth,
        itemStyle: {
            color: props.useGradient ? {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    { offset: 1, color: props.colors[index] },
                    { offset: 0, color: lightenColor(props.colors[index], 30) }
                ]
            } : props.colors[index],
            borderRadius: index === props.series.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0],
            borderColor: '#fff',
            borderWidth: 1
        }
    }))

    return options
})

// 輔助函數：調亮顏色
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = (num >> 8 & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16)
        .slice(1);
}
</script>

<style lang="scss" scoped></style>
