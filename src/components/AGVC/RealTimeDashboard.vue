<template>
    <div class="">
        <el-row class="h-100" :gutter="5">
            <el-col :lg="8" class="h-100 pt-2">
                <div class="agvc-info h-100 d-flex flex-column justify-content-space-between">
                    <!-- 系統運轉模式 -->
                    <el-card class="">
                        <template #header>
                            <div class="d-flex justify-content-between align-items-center">
                                <span>系統運轉模式</span>
                                <el-button-group>
                                    <el-button
                                        :type="systemStatus.maintenance ? 'danger' : 'success'"
                                        size="small"
                                        @click="toggleMaintenance"> {{ systemStatus.maintenance ? '維護模式' : '運轉模式' }} </el-button>
                                </el-button-group>
                            </div>
                        </template>
                        <div class="system-status">
                            <div class="status-item">
                                <span class="status-label">Host 連線狀態:</span>
                                <div class="status-value">
                                    <el-tag :type="systemStatus.hostConnected ? 'success' : 'info'" class="ml-2">
                                        <el-icon class="status-icon">
                                            <component :is="systemStatus.hostConnected ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
                                        </el-icon> {{ systemStatus.hostConnected ? 'ONLINE' : 'OFFLINE' }} </el-tag>
                                </div>
                            </div>
                            <div class="status-item">
                                <span class="status-label">搬運命令派送模式:</span>
                                <div class="status-value">
                                    <el-tag :type="systemStatus.isRemote ? 'warning' : 'info'" class="ml-2">
                                        <el-icon class="status-icon">
                                            <component :is="systemStatus.isRemote ? 'Connection' : 'Switch'" />
                                        </el-icon> {{ systemStatus.isRemote ? 'REMOTE' : 'LOCAL' }} </el-tag>
                                </div>
                            </div>
                        </div>
                    </el-card>
                    <!-- 任務列表 -->
                    <el-card class="my-2">
                        <template #header>
                            <div class="d-flex justify-content-between align-items-center">
                                <span>任務列表</span>
                                <el-button-group>
                                    <el-button type="primary" size="small">當前任務</el-button>
                                    <el-button type="info" size="small">歷史記錄</el-button>
                                </el-button-group>
                            </div>
                        </template>
                        <el-table :data="taskList" stripe height="250px">
                            <el-table-column show-overflow-tooltip prop="id" label="任務ID" width="120" />
                            <el-table-column show-overflow-tooltip prop="type" label="類型" width="100" />
                            <el-table-column show-overflow-tooltip prop="status" label="狀態" width="100">
                                <template #default="{ row }">
                                    <el-tag :type="getTaskStatusType(row.status)"> {{ row.status }} </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="progress" label="進度">
                                <template #default="{ row }">
                                    <el-progress :percentage="row.progress" />
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                    <!-- 設備狀態列表 -->
                    <el-card class="flex-grow-1" id="eq-status-card">
                        <template #header>
                            <div class="d-flex justify-content-between align-items-center">
                                <span>設備狀態</span> {{ eqStatusCardHeight }},{{ eqStatusTableHeight }}
                            </div>
                        </template>
                        <el-table :data="agvList" stripe :style="{ height: eqStatusTableHeight }">
                            <el-table-column prop="id" label="ID" width="110" />
                            <el-table-column prop="status" label="狀態" width="100">
                                <template #default="{ row }">
                                    <el-tag :type="getStatusType(row.status)"> {{ row.status }} </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="battery" label="電量">
                                <template #default="{ row }">
                                    <el-progress :percentage="row.battery" />
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-card>
                </div>
            </el-col>
            <el-col :lg="16" class="h-100 d-flex flex-column pt-2">
                <el-card class="">
                    <template #header>
                        <div class="d-flex justify-content-between align-items-center">
                            <span>當前警報訊息</span>
                        </div>
                    </template>
                    <div class="alert-message text-danger">
                        <span>AGV-001 發生故障</span>
                    </div>
                </el-card>
                <el-card class="my-2">
                    <template #header>
                        <div class="d-flex justify-content-between align-items-center">
                            <span>歷史警報</span>
                        </div>
                    </template>
                    <el-table :data="agvList" stripe style="height: 246px">
                        <el-table-column prop="id" label="時間" width="120" />
                        <el-table-column align="center" prop="status" label="等級" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getStatusType(row.status)"> {{ row.status }} </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column align="center" show-overflow-tooltip prop="status" label="異常碼" width="100">
                            <template #default="{ row }">
                                <span>3303</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="battery" label="警報訊息">
                            <template #default="{ row }"> Message </template>
                        </el-table-column>
                    </el-table>
                </el-card>
                <el-card class="flex-fill">
                    <template #header>
                        <div class="d-flex justify-content-between align-items-center">
                            <span>Bird's Eye View</span>
                        </div>
                    </template>
                    <div class="map-container h-100"> 地圖區域 </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

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

const eqStatusTableHeight = computed(() => {
    return (eqStatusCardHeight.value * 0.8) + 'px'
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

const getStatusType = (status: string): string => {
    const types: Record<string, string> = {
        online: 'success',
        offline: 'danger',
        charging: 'warning'
    }
    return types[status] || 'info'
}

const getTaskStatusType = (status: string): string => {
    const types: Record<string, string> = {
        processing: 'primary',
        waiting: 'warning',
        completed: 'success',
        failed: 'danger'
    }
    return types[status] || 'info'
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
    color: #666;
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