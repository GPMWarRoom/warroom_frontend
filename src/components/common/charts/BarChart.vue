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
    data: {
        type: Array,
        required: true
    },
    xAxisName: {
        type: String,
        default: '時間'
    },
    yAxisName: {
        type: String,
        default: '數據'
    },
    barColor: {
        type: String,
        default: 'rgb(32, 160, 255)'
    },
    barWidth: {
        type: Number,
        default: 20
    },
    useGradient: {
        type: Boolean,
        default: true
    },
    startColor: {
        type: String,
        default: '#83bff6'
    },
    endColor: {
        type: String,
        default: '#188df0'
    }
})
const chartOptions = computed(() => {
    const options = new globalChartOptions()
    options.xAxis.name = props.xAxisName;
    options.yAxis.name = props.yAxisName;
    options.title.text = props.title;
    options.series = [
        {
            name: '數據',
            type: 'bar',
            data: props.data,
            itemStyle: {
                color: props.useGradient ? {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        { offset: 1, color: props.startColor },
                        { offset: 0, color: props.endColor }
                    ]
                } : props.barColor,
                borderRadius: [5, 5, 0, 0],
                borderColor: '#fff',
                borderWidth: 1,
            },
            barWidth: props.barWidth
        }
    ]
    return options
})
</script>
<style lang="scss" scoped></style>