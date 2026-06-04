<template>
    <div class="agv-status">
        <div class="header-bar">
            <el-button link @click="onBack" :icon="Back" class="back-btn">
                返回
            </el-button>
            <div class="header-divider"></div>
            <span class="header-title">{{ equipmentId }}：</span>
        </div>
        <div class="status-grid">
            <!-- 左側區域：電池和里程 -->
            <div class="left-panel ">
                <div class="panel-section">
                    <BatteryStatus
                        :percentage="Number(currentEquipment?.BatLevel?.toFixed(2)) || 0"
                        :temperature="20"
                        :current="currentEquipment?.BatChargeCurrent"
                        :voltage="currentEquipment?.BatVoltage" />
                </div>
                <div class="panel-section">
                    <Mileage
                        :total-mileage="currentEquipment?.Mileage || 0"
                        :daily-mileage="currentEquipment?.currentValue || 0"
                        :maintenance-mileage="currentEquipment?.maintainValue || 0"
                        :last-maintenance-date="new Date()" />
                </div>
                <div class="panel-section  flex-fill">
                    <TaskStats class="h-100"
                        :transport-tasks="transportTasks"
                        :charging-tasks="chargingTasks" />
                </div>
            </div>
            <!-- 右側區域：馬達狀態 -->
            <div class="right-panel">
                <MotorsStatus :motors="motors" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BatteryStatus from './components/BatteryStatus.vue'
import MotorsStatus from './components/MotorsStatus.vue'
import Mileage from './components/Mileage.vue'
import TaskStats from './components/TaskStats.vue'
import { Back } from '@element-plus/icons-vue'
import { realTimeStore } from '@/stores/realTime'

const props = defineProps<{ id: string }>()
const emit = defineEmits(['back'])

const realTimeData = realTimeStore()
const equipmentId = ref(props.id)

watch(
  () => props.id,
  (newId) => {
    equipmentId.value = newId
  }
)

const currentEquipment = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV.find(
    (item: any) => String(item.Name) === String(equipmentId.value)
  )
)
const currentTask = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_NoRealTimeTask.find(
    (item: any) => String(item.AGVName) === String(equipmentId.value)
  )
)

const motors = computed(() => {
  if (!currentEquipment.value) return []
  return [
    {
      name: '左輪',
      current: currentEquipment.value.MotorLeftCurrent ?? 0,
      voltage: currentEquipment.value.MotorLeftVoltage ?? 0
    },
    {
      name: '右輪',
      current: currentEquipment.value.MotorRightCurrent ?? 0,
      voltage: currentEquipment.value.MotorRightVoltage ?? 0
    },
    {
      name: '升降馬達',
      current: currentEquipment.value.LiftMotorCurrent ?? 0,
      voltage: currentEquipment.value.LiftMotorVoltage ?? 0
    }
  ]
})

const transportTasks = computed(() => {
  if (!currentTask.value) return { completed: 0, total: 0 }
  return {
    completed: currentTask.value.TransportCompleted ?? 0,
    total: currentTask.value.TransportTotal ?? 0
  }
})

const chargingTasks = computed(() => {
  if (!currentTask.value) return { completed: 0, total: 0 }
  return {
    completed: currentTask.value.ChargingCompleted ?? 0,
    total: currentTask.value.ChargingTotal ?? 0
  }
})

// Drawer 關閉時 emit back 事件
function onBack() {
  emit('back')
}
</script>
<style scoped lang="scss">
.agv-status {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
}

.page-title {
    color: #fff;
    margin-bottom: 20px;
    font-size: 1.5rem;
}

.status-grid {
    display: grid;
    grid-template-columns: minmax(300px, 1fr) minmax(300px, 1.5fr);
    gap: 10px;
    height: 100%;
}

.left-panel {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 100%;
}


.panel-section {
    display: flex;
    justify-content: center;
    width: 100%;
    // background-color: pink;
}

.right-panel {
    display: flex;
    justify-content: center;
    height: fit-content;
}

// 響應式設計
@media (max-width: 1200px) {
    .status-grid {
        grid-template-columns: 1fr;
        gap: 1px;
    }

    .right-panel {
        margin-top: 0;
    }

    .left-panel {
        gap: 15px;
    }
}

// 確保組件寬度一致
:deep(.battery-status),
:deep(.mileage-status),
:deep(.motors-status),
:deep(.task-stats) {
    width: 100%;
    max-width: none;
}

// 暗色主題優化
:deep(.el-card) {
    background: #1e1e1e;
    border: 1px solid #333;

    .el-card__header {
        border-bottom: 1px solid #333;
    }
}

.header-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 5px;
    padding: 10px 20px; // 高度縮小
    background: #23272f;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    min-height: 10px; // 可視需要調整
}

.back-btn {
    font-weight: bold;
    color: #fff;
    letter-spacing: 1px;
    font-size: 0.9rem;
}

.header-title {
    font-size: 1.0rem;
    font-weight: bold;
    color: #fff;
}

.header-divider {
  width: 1px;
  height: 24px;
  background: #4b5563; 
  margin: 0 8px;
}

</style>