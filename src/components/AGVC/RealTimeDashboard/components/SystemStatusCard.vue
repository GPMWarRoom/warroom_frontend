<template>
    <el-card>
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>系統運轉模式</span>
                <el-button-group>
                    <el-button class="tag-button"
                        :type="sysStatus?.RunMode ? 'danger' : 'success'"
                        size="small"
                        @click="$emit('toggle-maintenance')">
                        {{ sysStatus?.RunMode ? '維護模式' : '運轉模式' }}
                    </el-button>
                </el-button-group>
            </div>
        </template>
        <div class="system-status">
            <div class="status-item">
                <span class="status-label">Host 連線狀態:</span>
                <div class="status-value">
                    <el-tag effect="dark" :type="sysStatus?.HostConnMode ? 'success' : 'danger'" class="ml-2 tag-button">
                        {{ sysStatus?.HostConnMode ? 'ONLINE' : 'OFFLINE' }}
                    </el-tag>
                </div>
            </div>
            <div class="status-item">
                <span class="status-label">搬運命令派送模式:</span>
                <div class="status-value">
                    <el-tag effect="dark" :type="sysStatus?.HostOperMode ? 'success' : 'warning'" class="ml-2 tag-button">
                        {{ sysStatus?.HostOperMode ? 'REMOTE' : 'LOCAL' }}
                    </el-tag>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'
const realTimeData = realTimeStore()
const sysStatus = computed(() => realTimeData.AGVC_RealTimeDashboard_SysStatus[0])

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