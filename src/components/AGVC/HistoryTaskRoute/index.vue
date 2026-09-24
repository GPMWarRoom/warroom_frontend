<template>
    <div class="history-task-route">
        <div class="card history-card">
            <div class="history-header">
                <h3>歷史任務路線</h3>
                <el-button
                    :icon="RefreshRight"
                    :loading="isHistoryLoading"
                    @click="loadHistoryTasks"
                    size="small"
                >
                    {{ isTaskListLoaded ? '重新載入任務' : '載入任務資料' }}
                </el-button>
            </div>

            <div
                v-if="!isTaskListLoaded && !isHistoryLoading"
                class="history-placeholder"
            >
                選擇右上角日期後，點擊上方按鈕載入歷史任務路線資料
            </div>
            <div
                v-else-if="isHistoryLoading"
                class="history-placeholder is-loading"
            >
                <el-icon class="is-loading"><RefreshRight /></el-icon>
                任務資料載入中...
            </div>
            <div class="history-content" v-else-if="realTimeData.AGVC_TrafficEfficiency_TaskList.length > 0">
                <div class="history-tasks">
                    <el-table
                        :data="paginatedTaskList"
                        border
                        size="small"
                        height="100%"
                        :row-key="row => row.TaskName"
                    >
                        <el-table-column align="center" width="50">
                            <template #header>
                                <el-checkbox
                                    :model-value="allSelected"
                                    @change="toggleAll"
                                />
                            </template>
                            <template #default="scope">
                                <el-checkbox v-model="scope.row.isSelected" />
                            </template>
                        </el-table-column>
                        <el-table-column show-overflow-tooltip align="center" prop="StartTime" label="開始時間" width="120" />
                        <el-table-column show-overflow-tooltip align="center" prop="FinishTime" label="結束時間" width="120" />
                        <el-table-column show-overflow-tooltip align="center" prop="DesignatedAGVName" label="AGV" width="80" />
                        <el-table-column show-overflow-tooltip prop="TaskName" label="任務名稱" min-width="120" />
                        <el-table-column show-overflow-tooltip prop="FromName" label="起點" min-width="90" />
                        <el-table-column show-overflow-tooltip prop="ToName" label="終點" min-width="90" />
                    </el-table>
                    <div class="pagination-container">
                        <el-pagination
                            v-model:current-page="currentPage"
                            v-model:page-size="pageSize"
                            :total="realTimeData.AGVC_TrafficEfficiency_TaskList.length"
                            layout="total, prev, pager, next"
                            size="small"
                            background
                        />
                    </div>
                </div>
                <div class="history-map">
                    <div class="content">
                        <TasksPathMap
                            class="h-100 w-100"
                            v-if="showMap"
                            mapId="map4"
                            :map-model="realTimeData.AGVC_TrafficStats_mapModel"
                            :data="mergedPathUseStats"
                            :key="mapModelKey"
                        />
                    </div>
                </div>
            </div>
            <div
                v-else-if="isTaskListLoaded && realTimeData.AGVC_TrafficEfficiency_TaskList.length === 0"
                class="history-placeholder is-empty"
            >
                無任務歷史資料
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import TasksPathMap from '@/components/AGVC/maps/TasksPathMap.vue'
import { RefreshRight } from '@element-plus/icons-vue'

const isHistoryLoading = ref(false)
const isTaskListLoaded = ref(false)
const emit = defineEmits(['loadHistoryTasks'])

const currentPage = ref(1)
const pageSize = ref(15)
const realTimeData = realTimeStore()
const mapModelKey = ref(Date.now())
const showMap = ref(false)

const paginatedTaskList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return realTimeData.AGVC_TrafficEfficiency_TaskList.slice(start, end)
})

const allSelected = computed(() =>
    paginatedTaskList.value.length > 0 &&
    paginatedTaskList.value.every(row => row.isSelected)
)

const toggleAll = (val: boolean) => {
    paginatedTaskList.value.forEach(row => {
        row.isSelected = val
    })
}

const selectedTasks = computed(() =>
    realTimeData.AGVC_TrafficEfficiency_TaskList.filter(row => row.isSelected)
)

const mergedPathUseStats = computed(() => {
    const pathCount: Record<string, number> = {}

    selectedTasks.value.forEach(task => {
        const tags = (task.TagsTracking || '').split('-').map(tag => tag.trim()).filter(Boolean)
        for (let i = 0; i < tags.length - 1; i++) {
            const a = Number(tags[i])
            const b = Number(tags[i + 1])
            if (!isNaN(a) && !isNaN(b)) {
                const tagA = Math.min(a, b)
                const tagB = Math.max(a, b)
                const key = `${tagA}-${tagB}`
                pathCount[key] = (pathCount[key] || 0) + 1
            }
        }
    })

    const counts = Object.values(pathCount)
    const minCount = counts.length ? Math.min(...counts) : 0
    const maxCount = counts.length ? Math.max(...counts) : 0

    const result: Record<string, { count: number, color: string }> = {}
    Object.entries(pathCount).forEach(([key, count]) => {
        const ratio = maxCount === minCount ? 0 : (count - minCount) / (maxCount - minCount)
        const r = Math.round(0 + ratio * 255)
        const g = Math.round(255 - ratio * 255)
        const color = `rgba(${r},${g},0,0.3)`
        result[key] = { count, color }
    })
    return result
})

let reloadQueued = false

async function loadHistoryTasks() {
    if (isHistoryLoading.value) {
        reloadQueued = true
        return
    }
    isHistoryLoading.value = true
    const loadPromise = new Promise<void>((resolve) => {
        emit('loadHistoryTasks', resolve)
    })
    try {
        await loadPromise
    } catch (error) {
        console.error('載入歷史任務失敗:', error)
    } finally {
        isHistoryLoading.value = false
        isTaskListLoaded.value = true
        currentPage.value = 1
    }
    if (reloadQueued) {
        reloadQueued = false
        await loadHistoryTasks()
    }
}

async function reloadIfLoaded() {
    if (!isTaskListLoaded.value && !isHistoryLoading.value) return
    await loadHistoryTasks()
}

defineExpose({ reloadIfLoaded })

watch(
    () => realTimeData.AGVC_TrafficStats_mapModel,
    (val) => {
        if (val && ('Points' in val || 'Map' in val)) {
            showMap.value = false
            mapModelKey.value = Date.now()
            setTimeout(() => { showMap.value = true }, 0)
        } else {
            showMap.value = false
        }
    },
    { immediate: true }
)
</script>
<style scoped lang="scss">
.history-task-route {
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    min-height: 0;
}

.history-card {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 0;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(32, 40, 60, 0.08);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 430px 12px 16px;
    border-bottom: 1px solid var(--border-color);
    flex: 0 0 auto;
}

.history-header h3 {
    margin: 0;
    padding: 0;
    line-height: 1.2;
    border-bottom: none;
}

.history-placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #aaa;
}

.history-placeholder.is-loading {
    color: #409eff;
}

.history-placeholder.is-empty {
    color: #f56c6c;
}

.history-content {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 16px;
    padding: 16px;
    align-items: stretch;
}

.history-tasks {
    flex: 0 1 52%;
    min-width: 280px;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: inherit;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(32, 40, 60, 0.04);
    border: 1px solid var(--border-color);
    overflow: hidden;
}

.pagination-container {
    padding: 12px;
    display: flex;
    justify-content: center;
    background: var(--surface-2);
    border-top: 1px solid var(--border-color);
    flex: 0 0 auto;
}

.history-tasks :deep(.el-table) {
    flex: 1;
    min-height: 0;
}

.history-tasks :deep(.el-table__header th) {
    background: var(--surface-2) !important;
    color: var(--text-color) !important;
}

.history-tasks :deep(.el-table__body td) {
    background: var(--table-row-bg) !important;
    color: #e0e0e0 !important;
}

.history-tasks :deep(.el-table__body tr:hover > td) {
    background: #394150 !important;
}

.history-map {
    flex: 1;
    min-width: 280px;
    min-height: 0;
    position: relative;
    background: var(--map-bg);
    border-radius: 8px;
    display: flex;
    box-shadow: 0 1px 4px rgba(32, 40, 60, 0.04);
}

.history-map .content {
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
}

@media (max-width: 992px) {
    .history-header {
        padding-right: 16px;
        flex-wrap: wrap;
    }

    .history-content {
        flex-direction: column;
    }

    .history-tasks,
    .history-map {
        min-height: 320px;
        width: 100%;
    }
}
</style>
