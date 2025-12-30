<template>
    <el-card class="system-mode-card">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>系統狀態</span>
            </div>
        </template>
        
        <div class="system-status-body">
            <div class="system-status">
                <div class="status-item">
                    <span class="status-label">運轉模式:</span>
                    <div class="status-value">
                        <el-tag effect="dark" :type="sysStatus?.RunMode ? 'success' : 'danger'" class="ml-2 tag-button" size="small">
                            {{ sysStatus?.RunMode ? '運轉模式' : '維護模式' }}
                        </el-tag>
                    </div>
                </div>
                <div class="status-item">
                    <span class="status-label">Host 連線狀態:</span>
                    <div class="status-value">
                        <el-tag effect="dark" :type="sysStatus?.HostConnMode ? 'success' : 'danger'" class="ml-2 tag-button" size="small">
                            {{ sysStatus?.HostConnMode ? 'ONLINE' : 'OFFLINE' }}
                        </el-tag>
                    </div>
                </div>
                <div class="status-item">
                    <span class="status-label">搬運命令派送模式:</span>
                    <div class="status-value">
                        <el-tag effect="dark" :type="sysStatus?.HostOperMode ? 'success' : 'warning'" class="ml-2 tag-button" size="small">
                            {{ sysStatus?.HostOperMode ? 'REMOTE' : 'LOCAL' }}
                        </el-tag>
                    </div>
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

defineEmits(['toggle-maintenance'])
</script>

<style scoped>

.system-mode-card {
    height: 150px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

:deep(.el-card__body) {
    padding: 0 15px !important;
    flex: 1; 
    display: flex;
    flex-direction: column;
}

.system-status-body {
    flex: 1; /* 關鍵：撐開高度 */
    display: flex;
    flex-direction: column;
    justify-content: center; /* 這裡的垂直置中才會生效 */
}

.system-status {
    display: flex;
    flex-direction: column;
    gap: 6px; /* 縮小間距以適應高度 */
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-label {
    color: #909399;
    font-size: 13px; /* 略微縮小字體 */
}

.tag-button {
    width: 90px;
    text-align: center;
    justify-content: center;
}

:deep(.el-tag) {
    min-width: 90px;
    height: 24px;
    line-height: 24px;
}
</style>