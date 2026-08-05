<template>
  <BaseChart :options="options" />
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  datas: { type: Array, required: true },
  onlyPercent: { type: Boolean, default: false }
})

const options = reactive({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    textStyle: { color: '#fff' },
    extraCssText: 'box-shadow: none; border: none;',
    borderWidth: 0,
    formatter: (params) => props.onlyPercent
      ? `${params.name}: ${params.value}%`
      : `${params.name}: ${params.value} (${params.percent}%)`
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    textStyle: { color: '#fff' }
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '60%'],
      data: [],
      label: {
        color: '#fff',
        formatter: (params) => props.onlyPercent
          ? `${params.name}: ${params.value}%`
          : `${params.name}: ${params.value} (${params.percent}%)`
      }
    }
  ]
})

watch(
  () => props.datas,
  (data) => {
    const colorMap = {
      'Run': '#2ecc71',
      'Down': '#c62828',
      'Alarm': '#e53935',
      'Idle': '#2196f3',
      'PM': '#f6b93d',
      'Unknown': '#616161'
    }
    const defaultColors = [
      '#5470c6', '#91cc75', '#fac858', '#ee6666',
      '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
    ]
    let colorIdx = 0
    options.series[0].data = data.map(item => {
      const color = colorMap[item.name] || defaultColors[colorIdx++ % defaultColors.length]
      return {
        ...item,
        itemStyle: { color }
      }
    })
  },
  { immediate: true, deep: true }
)

</script>