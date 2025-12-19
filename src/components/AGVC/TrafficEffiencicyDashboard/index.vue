<template>
    <div class="traffic-efficiency-dashboard">
        <el-row class="w-100 h-100" :gutter="10">
            <el-col :lg="12" class="cards-container d-flex flex-column justify-content-between ">
                <div class="d-flex w-100 mb-1 justify-content-between gap-2">
                    <div class="card w-100" style="height:130px">
                        <h3>平均任務成功率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="realTimeData.AGVC_TrafficEfficiency_TaskSuccess[0]?.AvgSuccessRate" :stroke-width="8" :width="70"></el-progress>
                        </div>
                    </div>
                    <div class="card w-100" style="height:130px">
                        <h3>自動化比率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="realTimeData.AGVC_TrafficEfficiency_TaskSuccess[0]?.AvgAutoRate" :stroke-width="8" :width="70"></el-progress>
                        </div>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>任務成功率走勢</h3>
                    <div class="content w-100 ">
                        <LineChart class="content h-100 w-100" :datas="[{name: '任務成功率', xData:realTimeData.AGVC_TrafficEfficiency_TaskSuccess.map(item => item.Date), 
                            yData:realTimeData.AGVC_TrafficEfficiency_TaskSuccess.map(item => item.DailySuccessRate)}]"></LineChart>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>設備Unload平均等待時間</h3>
                    <div class="content w-100  d-flex flex-column ">
                        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ" 
                            @change="handleSelectorChange" class="mb-2" >
                            <el-option
                                label="全部設備"
                                value="all"
                            />
                            <el-option
                                v-for="item in realTimeData.MainEQList"
                                :label="item.Name"
                                :value="item.Name"
                            />
                        </el-select>
                        <BarChart class="content flex-fill h-100 w-100" :useGradient="true" 
                            :datas="[{ name: '平均等待時間', xData:realTimeData.AGVC_TrafficEfficiency_UnloadWaitTime.map(item => item.Date), 
                                yData:realTimeData.AGVC_TrafficEfficiency_UnloadWaitTime.map(item => item.AvgUnloadTime)}]">
                        </BarChart>
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" class="cards-container d-flex flex-column justify-content-between "  style="height: 100%;">
                <div class="card ">
                    <h3>From-To 統計數據</h3>
                    <div class="h-100 text-light d-flex flex-column justify-content-between" >
                        <FromToTransportStas @selector-change="handleSelectorChange"/>
                    </div>
                </div>
                <div class="card my-1" style="flex: 1 1 0; min-height: 180px;">
                    <h3>啟終點執行時間 Box Plot</h3>
                    <div class="h-100">
                        <BoxPlotChart :useGradient="true" :datas="{
                            name: '執行時間(分)', 
                            xData: realTimeData.AGVC_TrafficEfficiency_CarryStaticsByPath.map(item => item.Path), 
                            yDataList: realTimeData.AGVC_TrafficEfficiency_CarryStaticsByPath.map(item => [
                            item.MinExecMinutes, 
                            item.Q1, 
                            item.Median, 
                            item.Q3, 
                            item.MaxExecMinutes
                            ])
                        }"/>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="w-100 h-100 extra-row" :gutter="10">
            <el-col :lg="24" class="cards-container">
                <div class="card w-100 history-card">
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
                        class="empty-history-placeholder"
                        style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 400px; color: #aaa;"
                    >
                        點擊上方按鈕載入歷史任務路線資料
                    </div>
                    <div 
                        v-else-if="isHistoryLoading" 
                        class="loading-history-placeholder"
                        style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 400px; color: #409eff;"
                    >
                        <el-icon class="is-loading" style="margin-right: 8px;"><RefreshRight /></el-icon>
                        任務資料載入中...
                    </div>
                    
                    <div class="history-content" v-else-if="realTimeData.AGVC_TrafficEfficiency_TaskList.length > 0">
                        <div class="history-tasks">
                        <el-table
                            :data="realTimeData.AGVC_TrafficEfficiency_TaskList"
                            style="width: 45vw; max-height: 80vh; overflow-y: auto;"
                            border
                            size="small"
                            width="45vw"
                            height="80vh"
                            :row-key="row => row.TaskName"
                            :default-selection="realTimeData.AGVC_TrafficEfficiency_TaskList.filter(row => row.isSelected)"
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
                            <el-table-column show-overflow-tooltip prop="TaskName" label="任務名稱" width="auto" />
                            <el-table-column show-overflow-tooltip prop="FromName" label="起點" width="auto" />
                            <el-table-column show-overflow-tooltip prop="ToName" label="終點" width="auto" />
                        </el-table>
                        </div>
                        <div class="history-map" style="max-height: 80vh; overflow-y: auto;">
                            <div class="content">
                                <TasksPathMap class="h-100 w-100" v-if="showMap"
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
                        class="no-data-history-placeholder"
                        style="flex: 1; display: flex; align-items: center; justify-content: center; min-height: 400px; color: #f56c6c;"
                    >
                        無任務歷史資料
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import LineChart from '../../common/charts/LineChart.vue'
import PieChart from '../../common/charts/PieChart.vue'
import BarChart from '../../common/charts/BarChart.vue'
import BoxPlotChart from '../../common/charts/BoxPlotChart.vue';
import FromToTransportStas from './components/FromToTransportStas/index.vue'
import TasksPathMap from '@/components/AGVC/maps/TasksPathMap.vue'
import { RefreshRight } from '@element-plus/icons-vue'

const isHistoryLoading = ref(false)
const isTaskListLoaded = ref(false)

const emit = defineEmits(['selector-change', 'loadHistoryTasks'])
function handleSelectorChange() {
  emit('selector-change')
}

const allSelected = computed(() =>
  realTimeData.AGVC_TrafficEfficiency_TaskList.length > 0 &&
  realTimeData.AGVC_TrafficEfficiency_TaskList.every(row => row.isSelected)
)

const toggleAll = (val: boolean) => {
  realTimeData.AGVC_TrafficEfficiency_TaskList.forEach(row => {
    row.isSelected = val
  })
}

const realTimeData = realTimeStore()

const mapModelKey = ref(Date.now())

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

    // 計算顏色
    const counts = Object.values(pathCount)
    const minCount = counts.length ? Math.min(...counts) : 0
    const maxCount = counts.length ? Math.max(...counts) : 0

    // 直接回傳物件
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

async function loadHistoryTasks() {
    if (isHistoryLoading.value) return
    isHistoryLoading.value = true
    const loadPromise = new Promise<void>((resolve) => {
        emit('loadHistoryTasks', resolve)
    })
    try {
        await loadPromise

    } catch (error) {
        console.error("載入歷史任務失敗:", error)
    } finally {
        isHistoryLoading.value = false
        if (realTimeData.AGVC_TrafficEfficiency_TaskList.length > 0) {
            isTaskListLoaded.value = true
        }
    }
}

const showMap = ref(false)
watch(
  () => realTimeData.AGVC_TrafficStats_mapModel,
  (val) => {
    if (val && val.Map) {
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
.traffic-efficiency-dashboard {
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    overflow-y: auto; // 加入垂直滾動條
    
    /* 美化 scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: #444a;
        border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #409effa0;
    }

    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #444a transparent;

    @media (max-width: 768px) {
        .cards-container {
            margin-bottom: 10px;

            .card {
                height: 160px;
            }
        }
    }

}
.extra-row {
    margin-top: 4px;
    min-height: 550px;
}
.history-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 0; /* 保持 history-card 的 padding 為 0 */
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(32,40,60,0.08);
}

.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center; 

    padding: 16px 32px; 
    border-bottom: 1px solid #2c3442;
    margin-bottom: 0; 
}

.history-header h3 {
    // *** 關鍵調整 ***
    margin: 0; /* 移除外邊距 */
    padding: 0; /* 確保內邊距也為 0 */
    line-height: 1.2; /* 將行高設為一個明確的值，避免高度計算不準確 */
    text-decoration: none; 
}

.history-content {
    flex: 1;
    display: flex;
    gap: 32px;
    padding: 24px 32px;
    align-items: stretch;
    height: 100%;
}

.history-tasks {
    min-width: 260px;
    max-width: 650px;
    overflow-y: auto;
    background: inherit;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(32,40,60,0.04);
    border: 1px solid #2c3442;
    transition: box-shadow 0.2s;
}
.history-tasks :deep(.el-table__header th) {
  background: #23272f !important; // header 深灰
  color: #fff !important;
}
.history-tasks :deep(.el-table__body td) {
  background: #2e3440 !important; // body 淺灰
  color: #e0e0e0 !important;
}
.history-tasks :deep(.el-table__body tr:hover>td) {
  background: #394150 !important;
}
.history-map {
    flex: 1; 
    min-width: 320px;
    height: 100%;
    min-height: 400px;
    position: relative;
    background: #222;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 4px rgba(32,40,60,0.04);
    transition: box-shadow 0.2s;
}
.history-map .content {
  width: 100%;
  height: 100%;
  min-height: 400px; // 加這行確保地圖有高度
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.history-map:hover {
  box-shadow: 0 4px 16px rgba(32,40,60,0.10);
}
</style>