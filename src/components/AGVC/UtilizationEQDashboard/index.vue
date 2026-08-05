<template>
  <div class="utilization-dashboard pt-2">
    <div class="query-section mb-2">
      <div class="query-bar">
        <div class="query-item">
          <span class="label">數據類別:</span>
          <el-select v-model="dataType" size="small" style="width: 110px">
            <el-option label="稼動率" value="EQUtilization" />
            <el-option label="警報" value="EQAlarms" />
          </el-select>
        </div>

        <div class="divider"></div>

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

        <div v-if="dataType === 'EQUtilization'" class="query-item">
          <span class="label">設備:</span>
          <el-select
            v-model="selectedDevice"
            size="small"
            filterable
            placeholder="選擇設備"
            style="width: 180px"
          >
            <el-option label="全部" value="all" />
            <el-option
              v-for="name in deviceNameList"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </div>
        <div v-if="dataType === 'EQUtilization'" class="divider"></div>

        <el-button 
          v-if="dataType === 'EQAlarms'" 
          @click="showFilterDialog = true" 
          icon="Filter" 
          size="small"
        >
          其他條件
        </el-button>
        <div v-if="dataType === 'EQAlarms'" class="divider"></div>

        <div class="action-group">
          <el-button @click="handleQuery" icon="Search" size="small">查詢</el-button>
          <el-button @click="handleExport" icon="Download" size="small">匯出</el-button>
        </div>
      </div>
    </div>

    <div class="content-body">
      <template v-if="dataType === 'EQUtilization'">
        <div 
          v-if="filteredDeviceEntries.length > 0" 
          class="dashboard-grid"
          :class="{ 'single-device': !!selectedDevice && selectedDevice !== 'all' }"
        >
          <div
            class="card"
            v-for="[deviceName, statusList] in filteredDeviceEntries"
            :key="deviceName"
          >
            <h3>{{ deviceName }} 稼動狀態</h3>
            <div class="content">
              <PieChart 
                v-if="Array.isArray(statusList) && statusList.length > 0" 
                :datas="getDevicePieData(statusList)" 
                :onlyPercent="true" 
              />
              <div v-else class="no-data-text mini">此設備暫無數據</div>
            </div>
          </div>
        </div>

        <div v-else class="no-data-container">
          <el-empty :description="`該時間區間查無稼動數據 (${queryParams.dateRange[0]} ~ ${queryParams.dateRange[1]})`" />
        </div>
      </template>

      <div v-else class="table-container">
        <el-table 
          :data="realTimeData.AGVC_UtilizationEQ_alarmData.data" 
          stripe 
          height="100%"
        >
          <el-table-column 
            type="index" 
            :index="indexMethod" 
            label="No." 
            width="65" 
            align="center" 
          />
          <el-table-column prop="FormattedTime" label="時間" width="180" align="center" />
          <el-table-column prop="Level" label="等級" width="100" align="center" />
          <el-table-column prop="Name" label="設備" width="150" align="center" />
          <el-table-column prop="AlarmCode" label="異常碼" width="100" align="center" />
          <el-table-column prop="Description_Zh" label="描述" align="left" />
          
          <template #empty>
            <el-empty description="該時間區間查無警報資料" />
          </template>
        </el-table>
      </div>

      <div v-if="dataType === 'EQAlarms'" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          @current-change="handleQuery"
          :page-size="pageSize"
          :total="realTimeData.AGVC_UtilizationEQ_alarmData.total"
          layout="slot, prev, pager, next"
          background
          size="small"
        >
          <span class="el-pagination__total">
            總筆數: {{ realTimeData.AGVC_UtilizationEQ_alarmData.total }}
          </span>
        </el-pagination>
      </div>
    </div>

    <el-dialog v-model="showFilterDialog" title="進階查詢條件" width="350px" center>
      <el-form :model="queryParams.alarms" label-width="80px">
        <!-- <el-form-item label="等級">
          <el-select v-model="queryParams.alarms.level" placeholder="全部" style="width: 100%" clearable>
            <el-option label="ALARM (1)" :value="1" />
            <el-option label="WARNING (2)" :value="2" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="設備名稱">
          <el-input v-model="queryParams.alarms.eqName" placeholder="輸入設備名稱" clearable />
        </el-form-item>
        <el-form-item label="異常代碼">
          <el-input v-model="queryParams.alarms.alarmCode" placeholder="輸入代碼" clearable />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="queryParams.alarms.description" placeholder="輸入描述關鍵字" clearable />
        </el-form-item><el-form-item>
          <div style="display: flex; gap: 10px; width: 100%;">
            <el-button @click="resetFilters" style="flex: 1">重置</el-button>
            <el-button type="primary" @click="applyFilters" style="flex: 2">套用過濾條件</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import PieChart from '../../common/charts/PieChart.vue'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import dayjs from 'dayjs'

const realTimeData = realTimeStore()
const emit = defineEmits(['realtime-action'])

const dataType = ref('EQUtilization')
const showFilterDialog = ref(false)
const selectedDevice = ref('')

const currentPage = ref(1)
const pageSize = ref(20)

// 查詢參數定義
const queryParams = reactive({
  // 預設 7 天前 到 昨天
  dateRange: [
    dayjs().subtract(7, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss'), // 7天前 00:00:00
    dayjs().subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss')   // 昨天 23:59:59
  ],
  alarms: {
    level: 'all',
    eqName: '',
    alarmCode: '',
    description: ''
  }
})

const deviceNameList = computed(() => {
  const data = realTimeData.AGVC_UtilizationEQ_deviceData
  if (!data || typeof data !== 'object') return []
  return Object.keys(data).sort((a, b) => a.localeCompare(b, 'zh-Hant'))
})

const filteredDeviceEntries = computed(() => {
  const data = realTimeData.AGVC_UtilizationEQ_deviceData
  if (!data || typeof data !== 'object') return []

  const entries = Object.entries(data) as [string, any[]][]
  if (!selectedDevice.value || selectedDevice.value === 'all') {
    return entries.sort(([a], [b]) => a.localeCompare(b, 'zh-Hant'))
  }
  return entries.filter(([name]) => name === selectedDevice.value)
})

watch(deviceNameList, (names) => {
  if (!names.length) {
    selectedDevice.value = ''
    return
  }
  // 有資料時預設選第一台，避免設備過多一次塞滿畫面
  if (!selectedDevice.value || (selectedDevice.value !== 'all' && !names.includes(selectedDevice.value))) {
    selectedDevice.value = names[0]
  }
})

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

function getDevicePieData(statusList: any[]) {
  const total = statusList.reduce((sum, item) => sum + item.Count, 0)
  return statusList.map(item => ({
    name: item.Status,
    value: total ? ((item.Count / total) * 100).toFixed(1) : 0
  }))
}

// 查詢邏輯
const handleQuery = () => {
  emit('realtime-action', {
    type: 'query',
    target: dataType.value,
    dateRange: queryParams.dateRange,
    params: dataType.value === 'EQAlarms' ? {
      ...queryParams.alarms,
      page: currentPage.value,
      pageSize: pageSize.value
    } : {}
  })
}

// 匯出邏輯
const handleExport = () => {
  emit('realtime-action', {
    type: 'export',
    target: dataType.value,
    dateRange: queryParams.dateRange,
    params: dataType.value === 'EQAlarms' ? {
      ...queryParams.alarms,
      page: currentPage.value,
      pageSize: pageSize.value
    } : {}
    
  })
}

const applyFilters = () => {
  showFilterDialog.value = false
  handleQuery()
}

onMounted(() => {
  handleQuery()
})

const indexMethod = (index: number) => {
  // (當前頁面 - 1) * 每頁筆數 + 目前索引 + 1
  return (currentPage.value - 1) * pageSize.value + index + 1
}
</script>

<style lang="scss" scoped>
.utilization-dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 10px;
}

/* 複刻任務列表查詢列風格 */
.query-section {
  padding: 10px 0;           /* 稍微增加上下內距 */
  margin-bottom: 5px;        /* 與下方內容保持微小間距 */
  border-bottom: 1px solid #333; /* 增加明顯的底線，顏色可依需求調成 #444 */
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
  color: #999;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #444;
  margin: 0 4px;
}

.action-group {
  display: flex;
  gap: 8px;
  margin-left: 4px;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 隱藏外層捲軸，捲軸要交給內層的 Grid 或 Table */
  padding: 10px 0;
  min-height: 0;    /* 關鍵：允許 Flex 子項目縮小，不撐開父層 */
}

.table-container {
  flex: 1;          /* 佔滿 content-body 的剩餘空間 */
  min-height: 0;    /* 確保表格能在此容器內縮放 */
  border: 1px solid #333;
}

.dashboard-grid {
  display: grid;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* 強制三欄平分寬度 */
  gap: 12px;
  align-content: start;

  &.single-device {
    grid-template-columns: minmax(0, 480px);
    justify-content: center;
  }

  .card {
    border: 1px solid #333;
    border-radius: 8px;
    padding: 12px;
    background: #1a1a1a;
    min-height: 280px;

    h3 {
      margin: 0 0 8px;
      font-size: 14px;
      color: #ddd;
      text-align: center;
    }

    .content {
      height: 240px;
    }
  }
}

/* 查無資料的置中容器 */
.no-data-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.no-data-text {
  color: #666;
  &.mini {
    font-size: 12px;
    padding: 20px;
  }
}

/* 讓 Element Plus 的 Empty 組件適應深色背景 */
:deep(.el-empty__description p) {
  color: #888;
}

.table-container {
  height: 100%;
  border: 1px solid #333;
}

/* 深色模式覆蓋 */
:deep(.el-input__wrapper),
:deep(.el-range-editor.el-input__inner) {
  background-color: #1a1a1a !important;
  border: 1px solid #333 !important;
  box-shadow: none !important;
  .el-range-input {
    background: transparent;
    color: #fff;
  }
}

/* 分頁容器固定在底部 */
.pagination-container {
  padding: 10px 5px;
  flex-shrink: 0;    /* 確保分頁不會被壓縮 */
  background-color: transparent; /* 或者與背景同色 */
  border-top: 1px solid #222;    /* 可選：增加一點視覺區隔 */
}
</style>