<template>
    <el-card class="my-2 task-card">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>任務列表</span>
                <el-button-group>
                    <el-button
                        :type="currentTab === 'current' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'current'"
                    >當前任務</el-button>
                    <el-button
                        :type="currentTab === 'completed' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'completed'"
                    >歷史記錄</el-button>
                    <el-button
                        :type="currentTab === 'query' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'query'"
                    >查詢/匯出</el-button>
                </el-button-group>
            </div>
        </template>

        <div class="content-body">
            <div v-if="currentTab === 'query'" class="query-section">
                <div class="query-bar">
                    <div class="query-item">
                        <span class="label">時間範圍:</span>
                        <el-date-picker
                            v-model="queryParams.dateRange"
                            type="datetimerange"
                            range-separator="-"
                            start-placeholder="開始"
                            end-placeholder="結束"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            size="small"
                            style="width: 340px"
                        />
                    </div>
                    <div class="divider"></div>
                    <el-button @click="showFilterDialog = true" icon="Filter" size="small">
                        其他條件
                    </el-button>
                    <div class="divider"></div>
                    <div class="action-group">
                        <el-button @click="handleQuery" icon="Search" size="small">查詢</el-button>
                        <el-button @click="handleExport" icon="Download" size="small">匯出</el-button>
                    </div>
                </div>
            </div>

            <div class="table-container">
                <el-table :data="filteredTasks" stripe height="100%">
                    <el-table-column show-overflow-tooltip prop="DesignatedAGVName" label="AGV" width="auto" align="center"/>
                    <el-table-column show-overflow-tooltip prop="StartTime" label="開始時間" width="auto" align="center" />
                    <el-table-column show-overflow-tooltip prop="FinishTime" label="結束時間" width="auto" align="center" />
                    <el-table-column show-overflow-tooltip prop="TaskName" label="任務ID" width="120" align="center" />
                    <el-table-column show-overflow-tooltip prop="Action" label="類型" width="auto" align="center">
                        <template #default="{ row }">
                            {{ actionMap[row.Action] }}
                        </template>
                    </el-table-column>
                    <el-table-column show-overflow-tooltip prop="FromName" label="起點" width="auto" align="center" />
                    <el-table-column show-overflow-tooltip prop="ToName" label="終點" width="auto" align="center" />
                    <el-table-column show-overflow-tooltip prop="State" label="狀態" width="120" align="center">
                        <template #default="{ row }">
                            <el-tag :type="getTaskStatusType(row.State)">{{ stateMap[row.State] }}</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div v-if="currentTab === 'query'" class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    @current-change="handleQuery"
                    :page-size="pageSize"
                    :total="realTimeData.AGVC_RealTimeDashboard_Query_Tasks.total"
                    layout="slot, prev, pager, next" 
                    background
                    size="small"
                >
                    <span class="el-pagination__total">
                        總筆數: {{ realTimeData.AGVC_RealTimeDashboard_Query_Tasks.total }}
                    </span>
                </el-pagination>
            </div>
            <div v-else class="pagination-placeholder"></div>
        </div>

        <el-dialog v-model="showFilterDialog" title="進階查詢條件" width="350px" center>
            <el-form :model="queryParams.tasks" label-width="80px">
                <el-form-item label="AGV 名稱">
                    <el-select v-model="queryParams.tasks.agvName" placeholder="請選擇" style="width: 100%" clearable>
                        <el-option label="全部" value="all" />
                        <el-option
                            v-for="agv in realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV"
                            :key="agv.Name"
                            :label="agv.Name"
                            :value="agv.Name"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="任務ID">
                    <el-input v-model="queryParams.tasks.taskName" placeholder="輸入任務ID" clearable @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item label="類型">
                    <el-select v-model="queryParams.tasks.action" placeholder="請選擇" style="width: 100%" clearable>
                        <el-option label="全部" value="all" />
                        <el-option label="移動" :value="0" />
                        <el-option label="取貨" :value="1" />
                        <el-option label="放貨" :value="7" />
                        <el-option label="充電" :value="8" />
                        <el-option label="搬運" :value="9" />
                    </el-select>
                </el-form-item>
                <el-form-item label="狀態">
                    <el-select v-model="queryParams.tasks.state" placeholder="請選擇" style="width: 100%" clearable>
                        <el-option label="全部" value="all" />
                        <el-option label="processing" :value="1" />
                        <el-option label="completed" :value="4" />
                        <el-option label="waiting" :value="5" />
                        <el-option label="failed" :value="6" />
                        <el-option label="canceled" :value="7" />
                    </el-select>
                </el-form-item>
                <el-form-item label="起點">
                    <el-input v-model="queryParams.tasks.fromStation" placeholder="輸入起點tag" clearable />
                </el-form-item>
                <el-form-item label="終點">
                    <el-input v-model="queryParams.tasks.toStation" placeholder="輸入終點tag" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="applyFilters" style="width: 100%">套用過濾條件</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </el-card>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import dayjs from 'dayjs'

const emit = defineEmits(['realtime-action'])
const realTimeData = realTimeStore()
const currentTab = ref<'current' | 'completed' | 'query'>('current')
const currentPage = ref(1)
const pageSize = ref(20)

const filteredTasks = computed(() => {
    switch (currentTab.value) {
        case 'current':
            return (realTimeData.AGVC_RealTimeDashboard_Tasks || []).filter(task => task.IsCompleted === 0);
        case 'completed':
            return (realTimeData.AGVC_RealTimeDashboard_Tasks || []).filter(task => task.IsCompleted === 1);
        case 'query':
            return realTimeData.AGVC_RealTimeDashboard_Query_Tasks.data || [];
        default:
            return [];
    }
});

const taskStatustypes: Record<number, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    1: 'primary',
    4: 'success',
    5: 'warning',
    6: 'danger'
}

const getTaskStatusType = (status: number): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
    return taskStatustypes[status] ?? 'info'
}

const actionMap: Record<number, string> = {
    0: '移動', 1: '取貨', 7: '放貨', 8: '充電', 9: '搬運', 
}

const stateMap: Record<number, string> = {
    1: 'processing', 4: 'completed', 5: 'waiting', 6: 'failed', 7: 'canceled', 
}

const showFilterDialog = ref(false)

const queryParams = reactive({
    dateRange: [
        dayjs().subtract(7, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
    ],
    tasks: {
        agvName: 'all',
        taskName: '',
        action: 'all',
        state: 'all',
        fromStation: '',
        toStation: ''
    }
})

const handleQuery = () => {
    emit('realtime-action', {
        type: 'query',
        target: 'tasks',
        dateRange: queryParams.dateRange,
        params: {
            ...queryParams.tasks,
            page: currentPage.value,
            pageSize: pageSize.value
        },
    })
}

const handleExport = () => {
    emit('realtime-action', {
        type: 'export',
        target: 'tasks',
        dateRange: queryParams.dateRange,
        params: queryParams.tasks,
    })
}

const applyFilters = () => {
    showFilterDialog.value = false
    handleQuery();
}
</script>

<style scoped>
/* 1. 設定 Card 固定高度 */
.task-card {
    height: 350px; /* 您可以根據需要調整此像素值 */
    display: flex;
    flex-direction: column;
}

/* 2. 讓 Card Body 撐滿並內部使用 Flex */
:deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0; /* 移除預設 padding 以便內部精確控制 */
    overflow: hidden;
}

.content-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* 3. 各區塊間距調整 */
.query-section {
    padding: 5px 5px;
    flex-shrink: 0; /* 防止被壓縮 */
}

.table-container {
    flex: 1; /* 自動填滿剩餘高度 */
    padding: 5 5px; /* 回補剛剛 card body 拿掉的 padding */
    overflow: hidden;
}

.pagination-container {
    padding: 5px 5px;
    flex-shrink: 0;
}

.pagination-placeholder {
    height: 15px; /* 當沒有分頁時佔用的小空間，確保表格不會貼死底部 */
}

.query-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
}

.query-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.label {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
}

.divider {
    width: 1px;
    height: 20px;
    background-color: #dcdfe6;
    margin: 0 4px;
}

.action-group {
    display: flex;
    gap: 8px;
    margin-left: 4px;
}

:deep(.el-range-editor.el-input__inner) {
    padding: 0 10px;
}

:deep(.el-pagination__total) {
    font-weight: 500;
    margin-right: 16px;
}

:deep(.el-pager li) {
    margin: 0 2px;
    border-radius: 4px;
}
</style>