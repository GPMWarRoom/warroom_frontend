<template>
  <el-card class="my-2 alarm-card">
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <span>歷史警報</span>
        <el-button-group>
          <el-button
            :type="currentTab === 'list' ? 'primary' : 'info'"
            size="small"
            @click="currentTab = 'list'"
          >歷史列表</el-button>
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
          <el-button 
            @click="showFilterDialog = true" 
            icon="Filter" 
            size="small"
            :class="{ 'filter-active': isFiltered }"
          >
            進階條件
          </el-button>
          <div class="divider"></div>
          <div class="action-group">
            <el-button @click="handleQuery" icon="Search" size="small">查詢</el-button>
            <el-button @click="handleExport" icon="Download" size="small">匯出</el-button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <el-table :data="displayData" stripe height="100%" style="width: 100%">
          <el-table-column prop="FormattedTime" label="時間" width="180" align="center" />
          <el-table-column align="center" prop="Level" label="等級" width="105">
            <template #default="{ row }">
              <el-tag :type="row.Level === 1 ? 'danger' : 'warning'" size="small" effect="dark" class="status-tag">
                {{ row.Level === 1 ? 'ALARM' : 'WARNING' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" show-overflow-tooltip prop="AlarmCode" label="異常碼" width="100" />
          <el-table-column align="center" show-overflow-tooltip prop="Equipment_Name" label="設備" width="100" />
          <el-table-column label="警報訊息" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.Description_Zh }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="currentTab === 'query'" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          @current-change="handleQuery"
          :page-size="pageSize"
          :total="realTimeData.AGVC_RealTimeDashboard_Query_Alarms.total"
          layout="slot, prev, pager, next"
          background
          size="small"
        >
          <span class="el-pagination__total">
            總筆數: {{ realTimeData.AGVC_RealTimeDashboard_Query_Alarms.total }}
          </span>
        </el-pagination>
      </div>
      <div v-else class="pagination-placeholder"></div>
    </div>

    <el-dialog v-model="showFilterDialog" title="警報進階過濾" width="350px" center append-to-body>
      <el-form :model="queryParams.alarms" label-width="80px">
        <el-form-item label="設備名稱">
          <el-input v-model="queryParams.alarms.eqName" placeholder="輸入設備名稱" clearable />
        </el-form-item>
        <el-form-item label="異常等級">
          <el-select v-model="queryParams.alarms.level" placeholder="請選擇" style="width: 100%" clearable>
            <el-option label="全部" value="all" />
            <el-option label="ALARM" :value="'1'" />
            <el-option label="WARNING" :value="'0'" />
          </el-select>
        </el-form-item>
        <el-form-item label="異常碼">
          <el-input v-model="queryParams.alarms.alarmCode" placeholder="輸入異常碼" clearable />
        </el-form-item>
        <el-form-item label="警報訊息">
          <el-input v-model="queryParams.alarms.description" placeholder="輸入警報訊息" clearable />
        </el-form-item>
        <el-form-item>
          <div style="display: flex; gap: 10px; width: 100%;">
            <el-button @click="resetFilters" style="flex: 1">重置</el-button>
            <el-button type="primary" @click="applyFilters" style="flex: 2">套用過濾條件</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import dayjs from 'dayjs'

const emit = defineEmits(['realtime-action'])
const realTimeData = realTimeStore()

const currentTab = ref<'list' | 'query'>('list')
const currentPage = ref(1)
const pageSize = ref(20)
const showFilterDialog = ref(false)


const isFiltered = computed(() => {
  const a = queryParams.alarms;
  return a.eqName !== '' || 
         a.level !== 'all' || 
         a.alarmCode !== '' || 
         a.description !== '';
});

// 重置過濾條件
const resetFilters = () => {
  queryParams.alarms = {
    eqName: '',
    level: 'all',
    alarmCode: '',
    description: ''
  };
  currentPage.value = 1;
  handleQuery(); // 重置後自動重新查詢
  showFilterDialog.value = false;
};

const displayData = computed(() => {
  if (currentTab.value === 'list') {
    return (realTimeData.AGVC_RealTimeDashboard_SystemAlarms || []).filter(item => item.Checked === true)
  } else {
    return realTimeData.AGVC_RealTimeDashboard_Query_Alarms.data || []
  }
})

const queryParams = reactive({
  dateRange: [
    dayjs().subtract(7, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
    dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss')
  ],
  alarms: {
    eqName: '',
    level: 'all',
    alarmCode: '',
    description:''
  }
})

const handleQuery = () => {
  emit('realtime-action', {
    type: 'query',
    target: 'alarms',
    dateRange: queryParams.dateRange,
    params: {
      ...queryParams.alarms,
      page: currentPage.value,
      pageSize: pageSize.value
    },
  })
}

const handleExport = () => {
  emit('realtime-action', {
    type: 'export',
    target: 'alarms',
    dateRange: queryParams.dateRange,
    params: queryParams.alarms,
  })
}

const applyFilters = () => {
  showFilterDialog.value = false
  currentPage.value = 1
  handleQuery()
}
</script>

<style scoped>
.status-tag {
  min-width: 80px; 
}
/* 1. 設定 Card 固定高度，與 Task Card 一致 */
.alarm-card {
  height: 350px; 
  display: flex;
  flex-direction: column;
}

/* 2. 讓 Card Body 撐滿並內部使用 Flex (透過 :deep 修正) */
:deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0; 
    overflow: hidden;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 3. 各區塊間距調整：同步為 5px */
.query-section {
  padding: 5px 5px;
  flex-shrink: 0;
}

.table-container {
  flex: 1;
  padding: 0 5px; /* 這裡改為 0 5px 以匹配任務列表的回補邏輯 */
  overflow: hidden;
}

.pagination-container {
  padding: 5px 5px;
  flex-shrink: 0;
}

.pagination-placeholder {
  height: 15px; /* 與任務列表一致 */
}

/* --- 工具列與 UI 細節 --- */
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

:deep(.el-pagination__total) {
  font-weight: 500;
  margin-right: 16px;
}

:deep(.el-pager li) {
  margin: 0 2px;
  border-radius: 4px;
}

:deep(.el-range-editor.el-input__inner) {
  padding: 0 10px;
}

.filter-active {
    background-color: rgba(0, 150, 255, 0.15) !important; /* 很淡的科技藍 */
    border-color: #0096ff !important;                     /* 明亮的邊框線 */
    color: #80caff !important;                             /* 淺藍色文字 */
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.3);            /* 淡淡的外發光 */
}

.filter-active:hover {
    background-color: rgba(64, 158, 255, 0.3) !important;
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}
</style>