<template>
  <BaseChart :options="options" />
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseChart from './BaseChart.vue'
import { STATUS_COLORS, FALLBACK_COLORS } from '../../../utils/eqStatusColors'

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
    let colorIdx = 0
    options.series[0].data = data.map(item => {
      const color = STATUS_COLORS[item.name] || FALLBACK_COLORS[colorIdx++ % FALLBACK_COLORS.length]
      return {
        ...item,
        itemStyle: { color }
      }
    })
  },
  { immediate: true, deep: true }
)

</script>