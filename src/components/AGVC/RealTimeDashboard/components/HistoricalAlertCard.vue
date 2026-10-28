<template>
  <el-card class="my-2 alarm-card">
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center title-group">
          <span>歷史警報</span>
          <el-button-group class="level-filter">
            <el-button :type="levelFilter === 'all' ? 'primary' : 'info'" size="small" @click="setLevelFilter('all')">All</el-button>
            <el-button :type="levelFilter === 'alarm' ? 'primary' : 'info'" size="small" @click="setLevelFilter('alarm')">Alarm</el-button>
            <el-button :type="levelFilter === 'warning' ? 'primary' : 'info'" size="small" @click="setLevelFilter('warning')">Warning</el-button>
          </el-button-group>
        </div>
        <div class="d-flex align-items-center header-actions">
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
        <el-tooltip content="放大檢視" placement="top">
          <el-icon class="expand-icon" @click="isExpanded = true"><FullScreen /></el-icon>
        </el-tooltip>
        </div>
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

    <el-dialog
      v-model="isExpanded"
      width="90%"
      top="5vh"
      append-to-body
      class="expand-view-dialog"
    >
      <template #header>
        <div class="d-flex justify-content-between align-items-center expand-dialog-header">
          <div class="d-flex align-items-center title-group">
            <span>歷史警報</span>
            <el-button-group class="level-filter">
              <el-button :type="levelFilter === 'all' ? 'primary' : 'info'" size="small" @click="setLevelFilter('all')">All</el-button>
              <el-button :type="levelFilter === 'alarm' ? 'primary' : 'info'" size="small" @click="setLevelFilter('alarm')">Alarm</el-button>
              <el-button :type="levelFilter === 'warning' ? 'primary' : 'info'" size="small" @click="setLevelFilter('warning')">Warning</el-button>
            </el-button-group>
          </div>
          <el-button-group>
            <el-button :type="currentTab === 'list' ? 'primary' : 'info'" size="small" @click="currentTab = 'list'">歷史列表</el-button>
            <el-button :type="currentTab === 'query' ? 'primary' : 'info'" size="small" @click="currentTab = 'query'">查詢/匯出</el-button>
          </el-button-group>
        </div>
      </template>
      <div class="expanded-panel">
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
            <el-button @click="showFilterDialog = true" icon="Filter" size="small" :class="{ 'filter-active': isFiltered }">進階條件</el-button>
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
            <el-table-column align="center" show-overflow-tooltip prop="AlarmCode" label="異常碼" width="120" />
            <el-table-column align="center" show-overflow-tooltip prop="Equipment_Name" label="設備" width="140" />
            <el-table-column label="警報訊息" min-width="240">
              <template #default="{ row }">{{ row.Description_Zh }}</template>
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
            <span class="el-pagination__total">總筆數: {{ realTimeData.AGVC_RealTimeDashboard_Query_Alarms.total }}</span>
          </el-pagination>
        </div>
      </div>
    </el-dialog>

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
import { ref, computed, reactive, watch } from 'vue'
import { useSessionRef, isOneOf } from '@/composables/useSessionState'
import { realTimeStore } from '@/stores/realTime'
import dayjs from 'dayjs'
import { FullScreen } from '@element-plus/icons-vue'

const emit = defineEmits(['realtime-action'])
const realTimeData = realTimeStore()

const isExpanded = ref(false)
const currentTab = useSessionRef<'list' | 'query'>('monitor-alarm-tab', 'list', isOneOf(['list', 'query']))
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

// 等級篩選（標題旁的 All／Alarm／Warning）：歷史列表直接在畫面上篩，查詢/匯出則帶入查詢條件
type LevelFilter = 'all' | 'alarm' | 'warning'
const LEVEL_FILTERS: LevelFilter[] = ['all', 'alarm', 'warning']
const levelFilter = useSessionRef<LevelFilter>('monitor-alarm-level', 'all', isOneOf(LEVEL_FILTERS))
// 後端的 Level：1 = ALARM、0 = WARNING（與進階條件的「異常等級」選單相同）
const LEVEL_QUERY_VALUE: Record<LevelFilter, string> = { all: 'all', alarm: '1', warning: '0' }

const matchesLevel = (item: any) => {
  if (levelFilter.value === 'alarm') return item.Level === 1
  if (levelFilter.value === 'warning') return item.Level !== 1
  return true
}

const displayData = computed(() => {
  if (currentTab.value === 'list') {
    return (realTimeData.AGVC_RealTimeDashboard_SystemAlarms || []).filter(item => item.Checked === true && matchesLevel(item))
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

// 按鈕與進階條件的「異常等級」選單共用同一個條件；重新整理後沿用上次選的等級
queryParams.alarms.level = LEVEL_QUERY_VALUE[levelFilter.value]

function setLevelFilter(value: LevelFilter) {
  if (levelFilter.value === value) return
  levelFilter.value = value
  queryParams.alarms.level = LEVEL_QUERY_VALUE[value]
  // 查詢模式下切換等級，直接重新查詢第一頁
  if (currentTab.value === 'query') {
    currentPage.value = 1
    handleQuery()
  }
}

// 在進階條件改了異常等級（或按重置）時，按鈕跟著切換
watch(() => queryParams.alarms.level, (level) => {
  const matched = LEVEL_FILTERS.find(key => LEVEL_QUERY_VALUE[key] === String(level ?? 'all'))
  levelFilter.value = matched ?? 'all'
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
  background-color: var(--border-color);
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
    background-color: color-mix(in srgb, var(--accent-color) 15%, transparent) !important;
    border-color: var(--accent-color) !important;
    color: var(--accent-color) !important;
    box-shadow: 0 0 8px color-mix(in srgb, var(--accent-color) 35%, transparent);
}

.filter-active:hover {
    background-color: color-mix(in srgb, var(--accent-color) 28%, transparent) !important;
    box-shadow: 0 0 10px color-mix(in srgb, var(--accent-color) 50%, transparent);
}

.header-actions {
  gap: 8px;
}

.title-group {
  gap: 12px;
}

.expand-icon {
  cursor: pointer;
  font-size: 16px;
}

.expanded-panel {
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.expand-dialog-header {
  width: 100%;
  padding-right: 24px;
}
</style>