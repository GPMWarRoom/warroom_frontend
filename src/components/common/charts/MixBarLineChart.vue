<template>
  <BaseChart
    ref="chartRef"
    :options="options"
  />
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseChart from './BaseChart.vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'

const props = defineProps({
  datas: {
    type: Object,
    required: true
  },
  barWidth: {
    type: Number,
    default: 15
  },
  colors: {
    type: Array,
    default: () => ['#79FF79', '#FF5151', '#ADADAD', '#FFB700', '#FF79FF']
  }
})

const defaultLineColors = [
  'rgb(32, 160, 255)',  // 藍
  'rgb(255, 159, 64)',  // 橘
  'rgb(255, 99, 132)',  // 紅
  'rgb(255, 206, 86)',  // 黃
  'rgb(153, 102, 255)', // 紫
  'rgb(75, 192, 192)',  // 青
]

const options = reactive(new globalChartOptions())

watch(
  () => props.datas,
  (data) => {
    if (!data || !data.xData || data.xData.length === 0) {
      options.series = []
      return
    }
    options.xAxis.data = data.xData
    options.xAxis.name = data.xAxisName || ''
    
    options.yAxis = [
      {
        type: 'value',
        name: data.yAxisBarName || '件數',
        splitLine: { show: true, lineStyle: { color: '#444444' } }, // 隱藏 y 軸 grid 線
      },
      {
        type: 'value',
        name: data.yAxisLineName || '執行時間(分)',
        splitLine: { show: false }, // 隱藏 y 軸 grid 線
        axisLine: { lineStyle: { color: '#888' } }
      }
    ]
    options.legend.data = [
      ...(data.barSeries?.map(s => s.name) || []),
      ...(data.lineSeries?.map(s => s.name) || [])
    ]
    options.series = [
      ...(data.barSeries || []).map((s, idx) => ({
        name: s.name,
        type: 'bar',
        data: s.data,
        yAxisIndex: 0,
        stack: 'total',
        barWidth: props.barWidth,
        itemStyle: {
          color: props.colors[idx % props.colors.length],
          borderColor: '#fff',
          borderWidth: 1
        }
      })),
      ...(data.lineSeries || []).map((s, idx) => ({
        name: s.name,
        type: 'line',
        data: s.data,
        yAxisIndex: 1,
        smooth: false,
        lineStyle: { color: defaultLineColors[idx % defaultLineColors.length] },
        itemStyle: { color: defaultLineColors[idx % defaultLineColors.length] }
      }))
    ]
    options.tooltip = {
      trigger: 'axis',
      backgroundColor: 'rgba(50, 50, 50, 0.95)',
      textStyle: { color: '#fff' },
      extraCssText: 'box-shadow: none; border: none;',
      axisPointer: { type: 'shadow' }
    }
    options.dataZoom = [
      {
        type: 'inside',
        xAxisIndex: [0],
        start: 0,
        end: 100
      }
    ]
  },
  { immediate: true, deep: true }
)
</script>