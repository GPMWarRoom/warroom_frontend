<template>
    <BaseChart
        ref="chartRef"
        v-if="options.series.length > 0"
        :options="options"
    />
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { reactive, watch } from 'vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'
  
const props = defineProps({
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
        default: '成功率'
    },
    title: {
        type: String,
        default: ''
    },
    width: {
        type: [String, Number],
        default: '100%'
    },
    height: {
        type: [String, Number],
        default: 300
    },
    tooltipFormatter: {
        type: [Function, String],
        default: null
    },
    // 次數類資料：y 軸刻度只顯示整數
    integerYAxis: {
        type: Boolean,
        default: false
    }
})
  
const defaultColors = [
  'rgb(32, 160, 255)',  // 藍
  'rgb(255, 159, 64)',  // 橘
  'rgb(255, 99, 132)',  // 紅
  'rgb(255, 206, 86)',  // 黃
  'rgb(153, 102, 255)', // 紫
  'rgb(75, 192, 192)',  // 青
]
  // 確保是 reactive 才會更新圖表
const options = reactive(new globalChartOptions())

watch(
() => props.datas,
(newDatas) => {
    if (props.tooltipFormatter) {
        options.tooltip.formatter = props.tooltipFormatter
    } else {
        delete options.tooltip.formatter
    }

    if (newDatas.length > 0) {
        options.title.text = props.title
        options.xAxis.name = props.xAxisName
        options.yAxis.name = props.yAxisName
        if (props.integerYAxis) {
            options.yAxis.minInterval = 1
        } else {
            delete options.yAxis.minInterval
        }
        options.xAxis.data = newDatas[0].xData

        options.series = newDatas.map((item, index) => {
            const color = defaultColors[index % defaultColors.length]
            return {
            name: item.name,
            type: 'line',
            data: item.yData,
            smooth: false,
            lineStyle: { color },
            itemStyle: { color }
            }
        })
    } else {
        options.series = []
        options.xAxis.data = []
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped lang="scss"></style>
  