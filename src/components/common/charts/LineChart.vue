<template>
    <BaseChart ref="chartRef" :options="options" :width="width" :height="height" />
</template>
<script setup>
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
    lineColor: {
        type: String,
        default: 'rgb(32, 160, 255)'
    },
    xAxisName: {
        type: String,
        default: '時間'
    },
    yAxisName: {
        type: String,
        default: '數據'
    }
})
const options = new globalChartOptions()
options.title.text = props.title;
options.xAxis.name = props.xAxisName;
options.yAxis.name = props.yAxisName;
options.series = [
    {
        name: '數據',
        type: 'line',
        data: props.data,
        itemStyle: {
            color: props.lineColor
        }
    }
]
</script>
<style lang="scss" scoped></style>