<template>
  <div class="h-100">
    <div class="header-bar">
        <span class="header-icon-label">
          <el-icon><Reading /></el-icon>
          <span class="select-agvc-label">Overview</span>
        </span>
    </div>
    <div class="header-divider"></div>
    <div class="info-content">
      <div><InfoCard /></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'
import { Reading } from '@element-plus/icons-vue'
import { realTimeStore } from '../stores/realTime'
import { useSignalR } from '@/composables/useSignalR'
import InfoCard from '@/components/OverviewView/InfoCard.vue'

const realTimeData = realTimeStore()
const { on, off, connection } = useSignalR()
const _Init = async () => {
    await connection.value?.invoke('InitOverviewData');
}

const handleOverviewData = (result: any) => {
    realTimeData.updateRealTimeData('Overview_Data', result);
}

onActivated(async () => {
    // 接收後端推播通知
    on('ReceiveOverview', handleOverviewData);
    _Init();
})

onDeactivated(async () => {
    
    off('ReceiveOverview', handleOverviewData)
})

</script>

<style scoped>
.h-100 {
  height: 100%;
  box-sizing: border-box;
  padding: 16px 16px 0 16px;
  overflow-y: auto; /* 內容超出時顯示捲軸 */
}
.header-bar {
  display: flex;
  align-items: center;
  /* justify-content: space-between;  // 移除這行 */
  gap: 16px; /* 增加間距 */
  background: #23272f;
  border-radius: 12px 12px 0 0;
  padding: 18px 24px 18px 24px;
  margin-bottom: 0;
}
.header-icon-label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.select-agvc-label {
  color: #fff;
  font-weight: bold;
  letter-spacing: 2px;
  font-size: 20px;
}
.header-select {
  background: #232323;
  border-radius: 6px;
  width: 180px; /* 固定寬度 */
  min-width: 180px;
  margin-left: 0; /* 移除多餘間距 */
}
.header-divider {
  border-bottom: 2px solid #e0e0e0;
  margin: 0 0 0 0;
}
.info-content {
  min-height: 200px;
  background: #232323;
  border-radius: 0 0 12px 12px;
  padding: 32px 24px;
  font-size: 18px;
  color: #fff;
  margin-bottom: 32px;
}
</style>
