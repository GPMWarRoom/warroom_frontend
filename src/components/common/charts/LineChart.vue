<template>
    <BaseChart
        ref="chartRef"
        v-if="options.series.length > 0"
        :options="options"
        :width="width"
        :height="height"
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
    }
})
  
  // 確保是 reactive 才會更新圖表
const options = reactive(new globalChartOptions())

watch(
() => props.datas,
(newDatas) => {
    if (newDatas.length > 0 && newDatas[0].xData && newDatas[0].yData) {
    options.title.text = props.title
    options.xAxis.name = props.xAxisName
    options.yAxis.name = props.yAxisName
    options.xAxis.data = newDatas[0].xData
    options.yAxis.min = 0
    options.yAxis.max = 100
    options.series = [
        {
        name: newDatas[0].name,
        type: 'line',
        data: newDatas[0].yData,
        smooth: false,
        lineStyle: { color: props.lineColor },
        itemStyle: { color: props.lineColor }
        }
    ]
    }
},
{ immediate: true, deep: true }
)
</script>

<style scoped lang="scss"></style>
  