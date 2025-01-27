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
        // 數據格式應為: [[min, Q1, median, Q3, max], ...]
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
    boxColor: {
        type: String,
        default: 'rgb(32, 160, 255)'
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
    options.xAxis.name = props.xAxisName
    options.xAxis.type = 'category'
    options.xAxis.data = props.categories
    options.yAxis.name = props.yAxisName
    options.title.text = props.title

    options.series = [{
        name: '箱型圖',
        type: 'boxplot',
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
            } : props.boxColor,
            borderColor: '#fff',
            borderWidth: 1
        },
        tooltip: {
            formatter: function (param) {
                return [
                    `${param.name}: `,
                    `最大值: ${param.data[4]}`,
                    `上四分位數: ${param.data[3]}`,
                    `中位數: ${param.data[2]}`,
                    `下四分位數: ${param.data[1]}`,
                    `最小值: ${param.data[0]}`
                ].join('<br/>')
            }
        }
    }]

    return options
})
</script>

<style lang="scss" scoped></style>
