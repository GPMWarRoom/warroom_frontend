<template>
    <div class="">
        <el-row class="h-100" :gutter="5">
            <el-col :lg="8" class="h-100 pt-2">
                <div class="agvc-info h-100 d-flex flex-column justify-content-space-between">
                    <SystemStatusCard :system-status="systemStatus" @toggle-maintenance="toggleMaintenance" />
                    <TaskListCard :task-list="taskList" />
                    <EquipmentStatusCard :agv-list="agvList" />
                </div>
            </el-col>
            <el-col :lg="16" class="h-100 d-flex flex-column pt-2">
                <CurrentAlertCard />
                <HistoricalAlertCard :agv-list="agvList" />
                <BirdsEyeViewCard />
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SystemStatusCard from '../cards/SystemStatusCard.vue'
import TaskListCard from '../cards/TaskListCard.vue'
import EquipmentStatusCard from '../cards/EquipmentStatusCard.vue'
import CurrentAlertCard from '../cards/CurrentAlertCard.vue'
import HistoricalAlertCard from '../cards/HistoricalAlertCard.vue'
import BirdsEyeViewCard from '../cards/BirdsEyeViewCard.vue'

interface AGV {
    id: string
    status: string
    battery: number
}

interface Task {
    id: string
    type: string
    status: string
    progress: number
}

interface SystemStatus {
    maintenance: boolean
    hostConnected: boolean
    isRemote: boolean
}

const eqStatusCardHeight = ref<number>(0)

onMounted(() => {
    const eqStatusCard = document.getElementById('eq-status-card')
    if (!eqStatusCard)
        return
    setTimeout(() => {
        eqStatusCardHeight.value = eqStatusCard?.clientHeight || 0
    }, 200)
})

const agvList = ref<AGV[]>([
    { id: 'AGV-001', status: 'online', battery: 85 },
    { id: 'AGV-002', status: 'charging', battery: 30 },
    { id: 'AGV-002', status: 'charging', battery: 30 },
    { id: 'AGV-002', status: 'charging', battery: 30 },
    { id: 'AGV-002', status: 'charging', battery: 30 },
    { id: 'AGV-002', status: 'charging', battery: 30 },
])

const taskList = ref<Task[]>([
    { id: 'T001sssssddddds', type: '搬運', status: 'processing', progress: 45 },
    { id: 'T002sssdss', type: '充電', status: 'waiting', progress: 0 },
    { id: 'T003ssdddddssss', type: '搬運', status: 'completed', progress: 100 },
    { id: 'T003ssdddddssss', type: '搬運', status: 'completed', progress: 100 },
    { id: 'T003ssdddddssss', type: '搬運', status: 'completed', progress: 100 }
])

const systemStatus = ref<SystemStatus>({
    maintenance: false,
    hostConnected: false,
    isRemote: false
})

const toggleMaintenance = () => {
    systemStatus.value.maintenance = !systemStatus.value.maintenance
}

</script>
<style scoped>
.agvc-map {
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 10px;
}

.map-container {
    height: 100%;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #661;
}

.el-card {
    --el-card-border-color: #333;
    --el-card-bg-color: #1e1e1e;
}

:deep(.el-card__header) {
    border-bottom: 1px solid #333;
    padding: 10px;
}

:deep(.el-card__body) {
    padding: 10px;
}

.system-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-label {
    color: #909399;
    font-size: 14px;
}

.status-value {
    display: flex;
    align-items: center;
}

.status-icon {
    margin-right: 4px;
    vertical-align: middle;
}

:deep(.el-tag) {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    min-width: 90px;
}
</style>