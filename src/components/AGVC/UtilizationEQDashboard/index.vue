<template>
  <div class="utilization-dashboard pt-2">
    <div class="query-section mb-2">
      <div class="query-bar">
        <div class="query-item">
          <span class="label">數據類別:</span>
          <el-select v-model="dataType" size="small" style="width: 110px">
            <el-option label="稼動率" value="utilization" />
            <el-option label="警報" value="alarm" />
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

        <el-button 
          v-if="dataType === 'alarm'" 
          @click="showFilterDialog = true" 
          icon="Filter" 
          size="small"
        >
          其他條件
        </el-button>
        <div v-if="dataType === 'alarm'" class="divider"></div>

        <div class="action-group">
          <el-button @click="handleQuery" icon="Search" size="small">查詢</el-button>
          <el-button @click="handleExport" icon="Download" size="small">匯出</el-button>
        </div>
      </div>
    </div>

    <div class="content-body">
      <template v-if="dataType === 'utilization'">
        <div 
          v-if="realTimeData.AGVC_UtilizationEQ_deviceData && Object.keys(realTimeData.AGVC_UtilizationEQ_deviceData).length > 0" 
          class="dashboard-grid"
        >
          <div
            class="card"
            v-for="(statusList, deviceName) in realTimeData.AGVC_UtilizationEQ_deviceData"
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
          :data="realTimeData.AGVC_RealTimeDashboard_Query_Alarms.data" 
          stripe 
          height="100%"
        >
          <el-table-column prop="Time" label="時間" width="180" align="center" />
          <el-table-column prop="Level" label="等級" width="100" align="center" />
          <el-table-column prop="Equipment_Name" label="設備" width="150" align="center" />
          <el-table-column prop="AlarmCode" label="異常碼" width="100" align="center" />
          <el-table-column prop="Description_Zh" label="描述" align="left" />
          
          <template #empty>
            <el-empty description="該時間區間查無警報資料" />
          </template>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="showFilterDialog" title="進階查詢條件" width="350px" center>
      <el-form :model="queryParams.alarms" label-width="80px">
        <el-form-item label="等級">
          <el-select v-model="queryParams.alarms.level" placeholder="全部" style="width: 100%" clearable>
            <el-option label="ALARM (1)" :value="1" />
            <el-option label="WARNING (2)" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="設備名稱">
          <el-input v-model="queryParams.alarms.eqName" placeholder="輸入設備名稱" clearable />
        </el-form-item>
        <el-form-item label="異常代碼">
          <el-input v-model="queryParams.alarms.alarmCode" placeholder="輸入代碼" clearable />
        </el-form-item>
        <el-form-item label="描述關鍵字">
          <el-input v-model="queryParams.alarms.description" placeholder="輸入描述關鍵字" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyFilters" style="width: 100%">套用過濾條件</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import PieChart from '../../common/charts/PieChart.vue'
import { ref, reactive, onMounted } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import dayjs from 'dayjs'

const realTimeData = realTimeStore()
const emit = defineEmits(['realtime-action'])

const dataType = ref('utilization')
const showFilterDialog = ref(false)

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
    level: null,
    eqName: '',
    alarmCode: '',
    description: ''
  }
})

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
    filters: dataType.value === 'alarm' ? queryParams.alarms : {}
  })
}

// 匯出邏輯
const handleExport = () => {
  emit('realtime-action', {
    type: 'export',
    target: dataType.value,
    dateRange: queryParams.dateRange,
    filters: dataType.value === 'alarm' ? queryParams.alarms : {}
  })
}

const applyFilters = () => {
  showFilterDialog.value = false
  handleQuery()
}

onMounted(() => {
  handleQuery()
})
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
  overflow-y: auto;
  padding: 10px 0;
  display: flex;       /* 讓內部容器可以撐開 */
  flex-direction: column;
}

.dashboard-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* 強制三欄平分寬度 */
  gap: 12px;
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
</style>