<template>
    <el-card class="system-mode-card">
        <template #header>
            <div class="status-header">
                <span class="status-title">系統狀態</span>
                <div class="status-tags">
                    <el-tag effect="dark" :type="sysStatus?.RunMode ? 'success' : 'danger'" size="small" title="運轉模式">
                        {{ sysStatus?.RunMode ? '運轉模式' : '維護模式' }}
                    </el-tag>
                    <el-tag effect="dark" :type="sysStatus?.HostConnMode ? 'success' : 'danger'" size="small" title="Host 連線狀態">
                        {{ sysStatus?.HostConnMode ? 'ONLINE' : 'OFFLINE' }}
                    </el-tag>
                    <el-tag effect="dark" :type="sysStatus?.HostOperMode ? 'success' : 'warning'" size="small" title="搬運命令派送模式">
                        {{ sysStatus?.HostOperMode ? 'REMOTE' : 'LOCAL' }}
                    </el-tag>
                </div>
                <el-tag v-if="filteredAlarms.length > 0" type="danger" size="small" class="pending-tag">
                    {{ filteredAlarms.length }} 筆待處理
                </el-tag>
            </div>
        </template>

        <!-- 當前警報訊息：多筆時每 2.5 秒輪播 -->
        <div class="alarm-line" :class="{ 'has-alarm': !!currentAlarm }">
            <span class="alarm-label">當前警報訊息：</span>
            <transition name="fade" mode="out-in">
                <span v-if="currentAlarm" :key="currentAlarmIndex" class="alarm-text">
                    [{{ currentAlarm.FormattedTime }}]
                    [{{ currentAlarm.AlarmCode }}]
                    [{{ currentAlarm.Equipment_Name }}]
                    [{{ currentAlarm.Description_Zh }} ({{ currentAlarm.Description_En }})]
                </span>
                <span v-else class="alarm-empty">
                    <el-icon><CircleCheckFilled /></el-icon>
                    目前系統無異常
                </span>
            </transition>
        </div>
    </el-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { realTimeStore } from '@/stores/realTime'
const realTimeData = realTimeStore()
const sysStatus = computed(() => realTimeData.AGVC_RealTimeDashboard_SysStatus[0])

defineEmits(['toggle-maintenance'])

const filteredAlarms = computed(() =>
    realTimeData.AGVC_RealTimeDashboard_SystemAlarms.filter(item => item.Checked === false)
)

const currentAlarmIndex = ref(0)
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

// 警報數量減少（例如被處理掉了）時重置索引
watch(() => filteredAlarms.value.length, (newLen) => {
    if (currentAlarmIndex.value >= newLen) {
        currentAlarmIndex.value = 0
    }
})
</script>

<style scoped>
.status-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
}

.status-title {
    white-space: nowrap;
}

.status-tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.status-tags :deep(.el-tag) {
    box-shadow: 0 0 12px color-mix(in srgb, var(--el-tag-text-color) 35%, transparent);
    min-width: 90px;
    height: 24px;
    line-height: 24px;
}

.pending-tag {
    margin-left: auto;
}

/* 標籤與訊息同一行，訊息太長時才接著往下折行 */
.alarm-line {
    padding: 8px 14px;
    border-left: 4px solid transparent;
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.5;
}

.alarm-line.has-alarm {
    border-left-color: var(--el-color-danger);
    background-color: color-mix(in srgb, var(--el-color-danger) 12%, transparent);
    color: var(--el-color-danger);
}

.alarm-label {
    margin-right: 6px;
    font-weight: 700;
    white-space: nowrap;
}

.alarm-line:not(.has-alarm) .alarm-label {
    color: var(--text-muted);
}

.alarm-text {
    overflow-wrap: anywhere;
}

.alarm-empty {
    display: inline-flex;
    vertical-align: middle;
    align-items: center;
    gap: 6px;
    color: var(--el-color-success);
}

/* 輪播切換動畫 */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>
