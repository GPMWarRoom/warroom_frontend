<template>
  <div class="agv-utilization">
    <!-- 狀態堆疊柱狀圖 -->
    <StackedBarChart
        v-if="selectedUtilizationType === 'status'"
        :yAxisName="'時間(時)'"
        :datas="currentChartData"
        :barWidth="8"
    />

    <!-- 里程折線圖 -->
    <LineChart
      v-if="selectedUtilizationType === 'odometer'"
      :yAxisName="'公里'"
      :datas="realTimeData.AGVC_Utilization_TotalMileage"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StackedBarChart from '../../../common/charts/StackedBarChart.vue'
import LineChart from '../../../common/charts/LineChart.vue'
import { realTimeStore } from '@/stores/realTime'

const realTimeData = realTimeStore()

const props = defineProps({
  datas: Array,
  selectedUtilizationType: String,
  currentIndex: {
    type: Number,
    default: 0
  }
})

const currentIndex = ref(props.currentIndex)

watch(() => props.currentIndex, (val) => {
  currentIndex.value = val
})

// 預設 chart 資料
const defaultChartData = {
  xData: [], // 讓日期也為空
  groups: ['Loading...'],
  stacks: ['Run', 'Available', 'Down', 'Charge'],
  yDataList: [
    [[], [], [], []] // 空的數值陣列
  ],
  originalDataList: [
    [[], [], [], []]
  ]
}

// 計算 chartData
const chartData = computed(() => {
  const raw = realTimeData.AGVC_Utilization_AGVAvailabilitys
  if (!raw || raw.length === 0) return defaultChartData

  const groups = [...new Set(raw.map(r => r.AGVName))]
  const xData = [...new Set(raw.map(r => r.Date.slice(0, 10)))]
  const stacks = ['Run', 'Available', 'Down', 'Charge']

  const yDataList = []
  const originalDataList = []

  // 每台 AGV
  groups.forEach(group => {
    const groupData = stacks.map(() => [])
    const groupOriginal = stacks.map(() => [])

    xData.forEach(date => {
      const records = raw.filter(r => r.AGVName === group && r.Date.startsWith(date))
      const stackValues = stacks.map(key => +records.reduce((sum, rec) => sum + (rec[key] || 0), 0).toFixed(2))
      stackValues.forEach((value, i) => groupOriginal[i].push(value))
      const total = stackValues.reduce((sum, v) => sum + v, 0)
      stackValues.forEach((value, i) => groupData[i].push(total > 0 ? +(value / total * 100).toFixed(2) : 0))
    })

    yDataList.push(groupData)
    originalDataList.push(groupOriginal)
  })

  // Total 加總
  const totalData = stacks.map(() => [])
  const totalOriginal = stacks.map(() => [])
  xData.forEach(date => {
    // 所有 AGV 某天的資料
    const records = raw.filter(r => r.Date.startsWith(date))
    const stackValues = stacks.map(key => +records.reduce((sum, rec) => sum + (rec[key] || 0), 0).toFixed(2))
    stackValues.forEach((value, i) => totalOriginal[i].push(value))
    const total = stackValues.reduce((sum, v) => sum + v, 0)
    stackValues.forEach((value, i) => totalData[i].push(total > 0 ? +(value / total * 100).toFixed(2) : 0))
  })
  groups.push('Total')
  yDataList.push(totalData)
  originalDataList.push(totalOriginal)

  return { xData, groups, stacks, yDataList, originalDataList }
})

// 當前顯示的 AGV 名稱
const currentGroup = computed(() => chartData.value.groups[currentIndex.value] || 'N/A')

// 當前顯示的 chart 資料
const currentChartData = computed(() => {
  const i = currentIndex.value
  return {
    xData: chartData.value.xData,
    groups: [chartData.value.groups[i]],
    stacks: chartData.value.stacks,
    yDataList: [chartData.value.yDataList[i]],
    originalDataList: [chartData.value.originalDataList[i]]
  }
})

// 換頁控制
const prevAGV = () => {
  if (currentIndex.value > 0) currentIndex.value--
}
const nextAGV = () => {
  if (currentIndex.value < chartData.value.groups.length - 1) currentIndex.value++
}
</script>

<style scoped>
.agv-utilization {
  width: 100%;
  height: 100%;
  position: relative; /* 右側浮動箭頭定位用 */
}

.chart-title-wrapper {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.arrow-floating {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.arrow-btn {
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  transition: 0.2s;
}

.arrow-btn:hover:not(:disabled) {
  background: #34495e;
}

.arrow-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
