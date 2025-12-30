<template>
  <el-card class="alarm-card">
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <span>當前警報訊息</span>
        <el-tag v-if="filteredAlarms.length > 0" type="danger" size="small">
          {{ filteredAlarms.length }} 筆待處理
        </el-tag>
      </div>
    </template>

    <div class="alarm-body">
      <transition name="fade" mode="out-in">
        <div v-if="currentAlarm" :key="currentAlarmIndex" class="alert-message text-danger">
          <span>
            [time: {{ currentAlarm.FormattedTime }}] 
            [code: {{ currentAlarm.AlarmCode }}] 
            [equipment: {{ currentAlarm.Equipment_Name }}]
            <br/>
            [{{ currentAlarm.Description_Zh }} ({{ currentAlarm.Description_En }})]
          </span>
        </div>

        <div v-else class="empty-state">
          <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
          <span>目前系統無異常</span>
        </div>
      </transition>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import { CircleCheckFilled } from '@element-plus/icons-vue' // 記得引入圖標

const realTimeData = realTimeStore()
const filteredAlarms = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_SystemAlarms.filter(item => item.Checked === false)
)

const currentAlarmIndex = ref(0)
// 這裡改用 computed 來取得當前 Alarm，更安全
const currentAlarm = computed(() => 
  filteredAlarms.value.length > 0 ? filteredAlarms.value[currentAlarmIndex.value] : null
)

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    if (filteredAlarms.value.length > 1) {
      currentAlarmIndex.value = (currentAlarmIndex.value + 1) % filteredAlarms.value.length
    } else {
      currentAlarmIndex.value = 0
    }
  }, 2500)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

// 額外保險：如果警報數量突然減少（例如被處理掉了），重置索引
watch(() => filteredAlarms.value.length, (newLen) => {
  if (currentAlarmIndex.value >= newLen) {
    currentAlarmIndex.value = 0
  }
})
</script>

<style scoped>
  
/* 固定卡片整體高度 */
.alarm-card {
  height: 150px; /* 您可以根據需求調整這個高度 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__body) {
  padding: 0  !important; /* 移除內邊距讓背景色塊能貼邊，或根據需求保留 */
  flex: 1;
  display: flex;
  flex-direction: column;
}

.alarm-body {
  flex: 1; /* 關鍵：佔滿 body 高度 */
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: center; /* 水平置中 */
  width: 100%;
}

.alert-message {
  width: 100%;
  border-left: 4px solid #f56c6c; /* 加個邊框色塊更像警報 */
  background-color: #f73f3f1a;
  padding: 15px;
  font-size: 0.95rem;
  word-break: break-all;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #67c23a; 
  gap: 8px;
}

.success-icon {
  font-size: 24px;
}

/* 過渡動畫 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>