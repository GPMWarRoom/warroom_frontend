<template>
  <div class="utilization-dashboard pt-2">
    <div class="dashboard-grid">
      <div
        class="card"
        v-for="(statusList, deviceName) in realTimeData.AGVC_UtilizationEQ_deviceData"
        :key="deviceName"
      >
        <h3>{{ deviceName }} 稼動狀態</h3>
        <div class="content">
          <PieChart :datas="getDevicePieData(statusList)" :onlyPercent="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PieChart from '../../common/charts/PieChart.vue'
import { computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'
const realTimeData = realTimeStore()

function getDevicePieData(statusList) {
  const total = statusList.reduce((sum, item) => sum + item.Count, 0)
  return statusList.map(item => ({
    name: item.Status,
    value: total ? ((item.Count / total) * 100).toFixed(1) : 0 // 百分比
  }))
}
</script>
<style lang="scss" scoped>
.utilization-dashboard {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px; // 卡片間距
  width: 100%;
}

.card .content {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
