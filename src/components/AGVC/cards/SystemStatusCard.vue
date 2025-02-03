<template>
    <el-card class="">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>系統運轉模式</span>
                <el-button-group>
                    <el-button class="tag-button"
                        :type="systemStatus.maintenance ? 'danger' : 'success'"
                        size="small"
                        @click="$emit('toggle-maintenance')">
                        {{ systemStatus.maintenance ? '維護模式' : '運轉模式' }}
                    </el-button>
                </el-button-group>
            </div>
        </template>
        <div class="system-status">
            <div class="status-item">
                <span class="status-label">Host 連線狀態:</span>
                <div class="status-value">
                    <el-tag :type="systemStatus.hostConnected ? 'success' : 'info'" class="ml-2 tag-button">
                        <el-icon class="status-icon">
                            <component :is="systemStatus.hostConnected ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
                        </el-icon>
                        {{ systemStatus.hostConnected ? 'ONLINE' : 'OFFLINE' }}
                    </el-tag>
                </div>
            </div>
            <div class="status-item">
                <span class="status-label">搬運命令派送模式:</span>
                <div class="status-value">
                    <el-tag :type="systemStatus.isRemote ? 'warning' : 'info'" class="ml-2 tag-button">
                        <el-icon class="status-icon">
                            <component :is="systemStatus.isRemote ? 'Connection' : 'Switch'" />
                        </el-icon>
                        {{ systemStatus.isRemote ? 'REMOTE' : 'LOCAL' }}
                    </el-tag>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
interface SystemStatus {
    maintenance: boolean
    hostConnected: boolean
    isRemote: boolean
}

defineProps<{
    systemStatus: SystemStatus
}>()

defineEmits<{
    (e: 'toggle-maintenance'): void
}>()
</script>

<style scoped>
.system-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.tag-button {
    width: 100px;
    /* border-radius: 10px; */
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