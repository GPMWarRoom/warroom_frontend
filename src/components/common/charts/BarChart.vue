<template>
    <BaseChart
        ref="chartRef"
        v-show="options.series.length > 0"
        :options="options"
    />
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseChart from './BaseChart.vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'

const props = defineProps({
    title: {
        type: String,
    },
    datas: {
        type: Array,
        required: true
    },
    xAxisName: {
        type: String,
        default: '時間'
    },
    yAxisName: {
        type: String,
        default: '等待時間(分)'
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

// 確保是 reactive 才會更新圖表
const options = reactive(new globalChartOptions())

watch(
  () => props.datas,
  (newDatas) => {
    if (Array.isArray(newDatas) && newDatas.length > 0 && newDatas[0]?.xData && newDatas[0]?.yData) {
      options.title.text = props.title
      options.xAxis.name = props.xAxisName
      options.yAxis.name = props.yAxisName
      options.xAxis.data = newDatas[0].xData
      options.series = [
        {
          name: newDatas[0].name,
          type: 'bar',
          data: newDatas[0].yData,
          smooth: false,
          itemStyle: {
            color: props.useGradient
              ? {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 1, color: props.startColor },
                    { offset: 0, color: props.endColor }
                  ]
                }
              : props.barColor,
            borderRadius: [5, 5, 0, 0],
            borderColor: '#fff',
            borderWidth: 1
          },
          barWidth: props.barWidth
        }
      ]
    }
  },
  { immediate: true, deep: true }
)
</script>
<style lang="scss" scoped></style>