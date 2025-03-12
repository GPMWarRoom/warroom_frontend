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
    datas: {
        type: Array,
        default: () => []
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

options.series = props.datas.map((data, index) => ({
        name: data.name,
        type: 'line',
        data: data.data,
    }))
</script>
<style lang="scss" scoped></style>