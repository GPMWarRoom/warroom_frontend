<template>
    <el-card class="my-2">
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
                <el-input 
                  v-model="queryParams.tasks.taskName" 
                  placeholder="輸入任務ID" 
                  clearable 
                  @keyup.enter="handleQuery" 
                />
              </el-form-item>
              <el-form-item label="類型">
                <el-select v-model="queryParams.tasks.action" placeholder="請選擇" style="width: 100%" clearable>
                  <el-option label="全部" value="all" />
                  <el-option label="移動" value=0 />
                  <el-option label="取貨" value=1 />
                  <el-option label="放貨" value=7 />
                  <el-option label="充電" value=8 />
                  <el-option label="搬運" value=9 />
                </el-select>
              </el-form-item>
              <el-form-item label="狀態">
                <el-select v-model="queryParams.tasks.state" placeholder="請選擇" style="width: 100%" clearable>
                  <el-option label="全部" value="all" />
                  <el-option label="processing" value=1 />
                  <el-option label="completed" value=4 />
                  <el-option label="waiting" value=5 />
                  <el-option label="failed" value=6 />
                  <el-option label="canceled" value=7 />
                </el-select>
              </el-form-item>
              <el-form-item label="起點">
                <el-input 
                  v-model="queryParams.tasks.taskName" 
                  placeholder="輸入起點tag" 
                  clearable 
                  @keyup.enter="handleQuery" 
                />
              </el-form-item>
              <el-form-item label="終點">
                <el-input 
                  v-model="queryParams.tasks.taskName" 
                  placeholder="輸入終點tag" 
                  clearable 
                  @keyup.enter="handleQuery" 
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="applyFilters" style="width: 100%">套用過濾條件</el-button>
              </el-form-item>
            </el-form>
          </el-dialog>
        </div>
        <el-table :data="filteredTasks" stripe height="250px">
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
            <!-- <el-table-column prop="progress" label="進度">
                <template #default="{ row }">
                    <el-progress :percentage="row.progress" />
                </template>
            </el-table-column> -->
        </el-table>
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
      return (realTimeData.AGVC_RealTimeDashboard_Tasks || [])
        .filter(task => task.IsCompleted === 0);

    case 'completed':
      return (realTimeData.AGVC_RealTimeDashboard_Tasks || [])
        .filter(task => task.IsCompleted === 1);

    case 'query':
      // 因為後端已經分好頁了，這裡直接回傳整包 Data
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
    0: '移動', 
    1: '取貨', 
    7: '放貨', 
    8: '充電', 
    9: '搬運', 
}

const stateMap: Record<number, string> = {
    1: 'processing', 
    4: 'completed', 
    5: 'waiting', 
    6: 'failed', 
    7: 'canceled', 
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

// 查詢邏輯
const handleQuery = () => {
  emit('realtime-action', {
    type: 'query',
    target: 'tasks',
    dateRange: queryParams.dateRange,
    params: {
      ...queryParams.tasks,
      page: currentPage.value, // 新增：傳送目前頁碼
      pageSize: pageSize.value // 新增：傳送每頁筆數
    },
  })
}

// 匯出邏輯
const handleExport = () => {
  emit('realtime-action', {
    type: 'export',
    target: 'tasks',
    dateRange: queryParams.dateRange,
    params: queryParams.tasks,
  })
}

// 套用進階過濾
const applyFilters = () => {
  showFilterDialog.value = false
  handleQuery();
}

</script>

<style scoped>
.query-section {
  padding: 10px 15px;
}

.query-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap; /* 確保在同一行 */
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

/* 垂直分隔線樣式 */
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

/* 調整 DatePicker 內部間距使其更緊湊 */
:deep(.el-range-editor.el-input__inner) {
  padding: 0 10px;
}

/* 分頁容器樣式 */
.pagination-container {
  display: flex;
  align-items: center;      /* 垂直居中 */
  padding: 6px 15px;       /* 上下 12px, 左右 15px 的間距 */
  margin-top: 5px;
}

/* 如果想讓 Total 文字更有質感，可以調整內部的樣式 */
:deep(.el-pagination__total) {
  font-weight: 500;
  margin-right: 16px; /* 讓總筆數跟頁碼分開一點 */
}

/* 調整分頁按鈕之間的間距 */
:deep(.el-pager li) {
  margin: 0 2px;
  border-radius: 4px; /* 圓角看起來比較現代 */
}

</style>