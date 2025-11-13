<template>
    <content-container>
        <div class="h-100 "
            :class="{
                'not-alive': aliveCheck && (aliveCheck.isAlive === false || aliveCheck.isVMSAlive === false)
            }"
        >
            <el-tabs v-model="activeTab" class="agvc-tabs" type="card" v-loading="loading" @tab-change="handleTabChange">
                <el-tab-pane :disabled="true" name="select-agvc" >
                    <template #label>
                        <div class="select-agvc-container">
                            <el-icon>
                                <LocationFilled />
                            </el-icon>
                            <span class="select-agvc-label">場域</span>
                            <el-select v-model="realTimeData.selectedAgvc" @change="handleAgvcChange">
                                <el-option v-for="item in agvcList" :key="item.id" :label="item.name" :value="item.value" />
                            </el-select>
                        </div>
                    </template>
                </el-tab-pane>
                <el-tab-pane label="即時監控" name="monitor">
                    <template #label>
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>即時監控</span>
                    </template>
                    <RealTimeDashboard v-if="activeTab === 'monitor'" class="tab-content-component" @show-equipment-status="handleShowEquipmentStatus" />
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-stats">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>交管狀態</span>
                    </template>
                    <TrafficStatsDashboard v-if="activeTab === 'traffic-stats' && realTimeData.AGVC_TrafficStats_mapModel" class="tab-content-component" ref="TrafficStatsRef"/>
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-efficiency">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>搬運效能統計</span>
                    </template>
                    <TrafficEfficiencyDashboard v-if="activeTab === 'traffic-efficiency'" class="tab-content-component" 
                        @selector-change="_Init" @loadHistoryTasks="loadHistoryTasks" :connection="connection"/>
                </el-tab-pane>
                <el-tab-pane name="utilization" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>設備稼動</span>
                    </template>
                    <UtilizationDashboard v-if="activeTab === 'utilization'" class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane name="utilizationEQ" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>週邊設備</span>
                    </template>
                    <UtilizationEQDashboard v-if="activeTab === 'utilizationEQ'" class="tab-content-component" />
                </el-tab-pane>
                <!-- <el-tab-pane label="任務管理" name="tasks">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>任務管理</span>
                    </template>
                    <AGVCMonitor class="tab-content-component" v-if="activeTab === 'tasks'" />
                </el-tab-pane>
                <el-tab-pane label="系統設定" name="settings">
                    <template #label>
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>系統設定</span>
                    </template>
                    <AGVCMonitor class="tab-content-component" v-if="activeTab === 'settings'" />
                </el-tab-pane> -->
            </el-tabs>

            <el-drawer
                v-model="showEquipmentDrawer"
                :with-header="false"
                size="55%"
                direction="rtl"
                :close-on-click-modal="true"
            >
                <AgvStatus v-if="equipmentType === 'agv'" :id="selectedEquipmentId" @back="showEquipmentDrawer = false"/>
                <RackStatus v-else-if="equipmentType === 'rack'" :id="selectedEquipmentId" @back="showEquipmentDrawer = false"/>
            </el-drawer>

            <div class="date-select" v-if="activeTab !== 'monitor'">
                <el-date-picker v-model="localDateRange" type="daterange" range-separator="至" start-placeholder="開始日期" end-placeholder="結束日期" @change="handleDateRangeChange"/>
                <el-button style="margin: 0px 2px" @click="_Init">查詢</el-button>
            </div>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import { ref, onActivated, onDeactivated, onMounted, watch, computed } from 'vue'
import { Monitor, List, LocationFilled } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'
import ContentContainer from '../components/ContentContainer.vue'
import RealTimeDashboard from '../components/AGVC/RealTimeDashboard/index.vue'
import TrafficStatsDashboard from '../components/AGVC/TrafficStatsDashboard/index.vue'
import TrafficEfficiencyDashboard from '../components/AGVC/TrafficEffiencicyDashboard/index.vue'
import UtilizationDashboard from '../components/AGVC/UtilizationDashboard/index.vue'
import UtilizationEQDashboard from '../components/AGVC/UtilizationEQDashboard/index.vue'
import { uiStatsStore } from '../stores/UiStats'
import { realTimeStore } from '../stores/realTime'
import { useSignalR } from '@/composables/useSignalR'
import { getMap } from '@/api/map'
import AgvStatus from '@/components/EquipmentStatus/AGV/index.vue'
import RackStatus from '@/components/EquipmentStatus/Rack/index.vue'
import { useAlarmStore } from '@/stores/alert'
import dayjs from 'dayjs'

const alarmStore = useAlarmStore()
const showEquipmentDrawer = ref(false)
const equipmentType = ref('')
const selectedEquipmentId = ref(null)
function handleShowEquipmentStatus({ id, type }) {
  equipmentType.value = type
  selectedEquipmentId.value = id
  showEquipmentDrawer.value = true
}

const { on, off, connection, isConnected } = useSignalR()

const TrafficStatsRef = ref()
const realTimeData = realTimeStore()
const loading = ref(realTimeData.loading)
const activeTab = ref('monitor')
const uiStats = uiStatsStore()
const agvcList = ref([])
const aliveCheck = ref({ isAlive: true, isVMSAlive: true })
onMounted(async () => {
    const res = await fetch('/config.json')
    const config = await res.json()
    agvcList.value = config.Schemas
})

async function loadHistoryTasks(resolve: () => void) {
    const map = ref()
    try {
        const mapData = await getMap(realTimeData.selectedAgvc)
        if (mapData) {
            map.value = mapData
            realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', map)
        }
    } catch (e) {
        map.value = null
        realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
    }
    await connection.value?.invoke('InitAGVEfficiency', 
        realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ, 
        realTimeData.AGVC_TrafficEfficiency_Selector.source,    
        realTimeData.AGVC_TrafficEfficiency_Selector.target,
        realTimeData.DateRange,
        true // 是否需要撈TaskList
    );
    resolve();
}

async function _Init() {
    loading.value = true
    const map = ref()
    switch (activeTab.value) {
        case 'monitor':
            await connection.value?.invoke('InitDataByTab');
            try {
                const mapData = await getMap(realTimeData.selectedAgvc)
                if (mapData) {
                    map.value = mapData
                    realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', map)
                }
            } catch (e) {
                // 地圖抓不到就不更新
                map.value = null
                realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
            }
            break;
        case 'traffic-stats':
            try {
                const mapData = await getMap(realTimeData.selectedAgvc)
                if (mapData) {
                    map.value = mapData
                    realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', map)
                }
            } catch (e) {
                map.value = null
                realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
            }
            await connection.value?.invoke('InitTrafficStats', realTimeData.DateRange)
            break;
        case 'traffic-efficiency':
            try {
                const mapData = await getMap(realTimeData.selectedAgvc)
                if (mapData) {
                    map.value = mapData
                    realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', map)
                }
            } catch (e) {
                map.value = null
                realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
            }
            await connection.value?.invoke('InitAGVEfficiency', 
                realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ, 
                realTimeData.AGVC_TrafficEfficiency_Selector.source,    
                realTimeData.AGVC_TrafficEfficiency_Selector.target,
                realTimeData.DateRange,
                false // 是否需要撈TaskList
            );
            break;
        case 'utilization':
            await connection.value?.invoke('InitAGVUtilization', 
                realTimeData.DateRange
            );
            break;
        case 'utilizationEQ':
            await connection.value?.invoke('InitUtilizationEQ', 
                realTimeData.DateRange
            );
            break;
    }
    loading.value = false
}
async function handleAgvcChange(value: string) {
    await subscribeToSchema(value, activeTab.value)
    await _Init()
}
const handleTabChange = async (tab: string) => {
    uiStats.setAGVCTabSelected(tab)
    await subscribeToSchema(realTimeData.selectedAgvc, activeTab.value)
    await _Init()
}
const tabStoreMap: Record<string, Record<string, string>> = {
    "monitor": {
        EQStatus_AGV: "AGVC_RealTimeDashboard_EQStatus_AGV",
        EQStatus_MainEQ: "AGVC_RealTimeDashboard_EQStatus_MainEQ",
        EQStatus_Rack: "AGVC_RealTimeDashboard_EQStatus_Rack",
        Tasks: "AGVC_RealTimeDashboard_Tasks",
        SysStatus: "AGVC_RealTimeDashboard_SysStatus",
        SystemAlarms: "AGVC_RealTimeDashboard_SystemAlarms",
        NoRealTimeTask: "AGVC_RealTimeDashboard_NoRealTimeTasks",
    },
};

let currentSubscribedSchema: string | null = null
let currentTab: string | null = null

async function subscribeToSchema(schema: string, tab: string) {
    if (!isConnected.value) return

    if (currentSubscribedSchema && currentTab) {
    await connection.value.invoke('AGVCUnsubscribe', currentSubscribedSchema, currentTab)
    console.log(`🔄 取消訂閱: ${currentSubscribedSchema}-${currentTab}`)
    }
    await connection.value.invoke('AGVCSubscribe', schema, tab)
    currentSubscribedSchema = schema
    currentTab = tab
    console.log(`✅ 已訂閱 schema: ${schema}-${tab}`)
}

function handleNotification(result: any) {
    const storeMap = tabStoreMap[currentTab];

    if (!storeMap) return;

    if (currentTab ==='monitor') {
        if (result.type === 'init') {
            for (const [key, value] of Object.entries(result.data)) {
            const storeKey = storeMap[key];
            if (storeKey) {
                realTimeData.updateRealTimeData(storeKey, value);
            }
            }
        } else if (result.type === 'update') {
            const storeKey = storeMap[result.table];
            if (storeKey) {
                realTimeData.updateRealTimeData(storeKey, result.data);
            }
        }
    }
}

function handleAGVEfficiency(result: any) {
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_TaskSuccess', result.TaskSuccess)
    realTimeData.updateRealTimeData('MainEQList', result.MainEQList)
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_UnloadWaitTime', result.UnloadWaitTime)
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_CarryStatics', result.CarryStatics)
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_TaskList', result.TaskList)
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_CarryStaticsByPath', result.CarryStaticsByPath)
}

function handleAGVUtilization(result: any) {
    realTimeData.updateRealTimeData('AGVC_Utilization_AGVAvailabilitys', result.AGVAvailabilitys)
    realTimeData.updateRealTimeData('AGVC_Utilization_NoAGVTasks', result.NoAGVTasks.NoTasks)
    realTimeData.updateRealTimeData('AGVC_Utilization_RemoteRate', result.NoAGVTasks.RemoteRate)
    realTimeData.updateRealTimeData('AGVC_Utilization_NoReject', result.NoAGVTasks.NoReject)
    realTimeData.updateRealTimeData('AGVC_Utilization_NoAGVAlarm', result.NoAGVAlarm)
    realTimeData.updateRealTimeData('AGVC_Utilization_TotalMileage', result.NoAGVTasks.TotalMileage)
    realTimeData.updateRealTimeData('AGVC_Utilization_ExchangeCount', result.NoAGVTasks.ExchangeCount)
    realTimeData.updateRealTimeData('AGVC_Utilization_TaskTypeRatio', result.TaskTypeRatio)
    realTimeData.updateRealTimeData('AGVC_Utilization_TaskAutoRatio', result.TaskAutoRatio)
}

function handleAGVUtilizationEQ(result: any) {
    realTimeData.updateRealTimeData('AGVC_UtilizationEQ_deviceData', result.deviceData)
}

function handleReceiveAliveCheck(result: any) {
    aliveCheck.value = result
}

function handleReceiveTrafficStats(result: any) {
    const stats = result.tagStopStats
    const colorMap: Record<string, { color: string, avgdurationseconds: number }> = {}
    stats.forEach((s: any) => {
        // 0-8, 8-16, 16-24, 24-32, >32
        let color = ''
    if (s.avgdurationseconds <= 8) color = 'rgba(0,200,83,0.8)'; // 綠
    else if (s.avgdurationseconds <= 16) color = 'rgba(255,214,0,0.8)'; // 黃
    else if (s.avgdurationseconds <= 24) color = 'rgba(255,160,0,0.8)'; // 橘
    else if (s.avgdurationseconds <= 32) color = 'rgba(255,87,34,0.8)'; // 橘紅
    else color = 'rgba(229,57,53,0.8)'; // 紅 >32
        colorMap[String(s.tag)] = {
            color,
            avgdurationseconds: s.avgdurationseconds
        }
    })
    const points = realTimeData.AGVC_TrafficStats_mapModel.Map.Points
    Object.values(points).forEach((point: any) => {
        const info = colorMap[String(point.TagNumber)]
        if (info) {
            point.TagStopColor = info.color
            point.TagStopInfo = info // 這裡存整個物件，hover 可用
        } else {
            point.TagStopColor = 'rgba(255,255,255,.2)'
            point.TagStopInfo = null
        }
    })
    const pathStats = result.pathUseStats || []
    const counts = pathStats.map((s: any) => s.count)
    const minCount = Math.min(...counts)
    const maxCount = Math.max(...counts)
    const pathUseStatsMap: Record<string, { count: number, color: string }> = {}
    pathStats.forEach((s: any) => {
        const ratio = maxCount === minCount ? 0 : (s.count - minCount) / (maxCount - minCount)
        const colorSteps = [
            'rgba(0,200,83,0.8)',    // 綠
            'rgba(255,214,0,0.8)',   // 黃
            'rgba(255,160,0,0.8)',   // 橘
            'rgba(255,87,34,0.8)',   // 橘紅
            'rgba(229,57,53,0.8)'    // 紅
        ]
        let colorIdx = 0
        if (ratio >= 0.8) colorIdx = 4
        else if (ratio >= 0.6) colorIdx = 3
        else if (ratio >= 0.4) colorIdx = 2
        else if (ratio >= 0.2) colorIdx = 1
        else colorIdx = 0
        const color = colorSteps[colorIdx]
        pathUseStatsMap[`${s.tagA}-${s.tagB}`] = { count: s.count, color }
    })
    realTimeData.updateRealTimeData('AGVC_TrafficStats_pathUseStats', pathUseStatsMap)
}

let intervalId: ReturnType<typeof setInterval> | null = null
let intervalAlive: ReturnType<typeof setInterval> | null = null
onActivated(async () => {
    // 接收後端推播通知
    on('ReceiveNotification', handleNotification);
    on('ReceiveAGVEfficiency', handleAGVEfficiency);
    on('ReceiveAGVUtilization', handleAGVUtilization);
    on('ReceiveTrafficStats', handleReceiveTrafficStats);
    on('ReceiveAliveCheck', handleReceiveAliveCheck);
    on('ReceiveUtilizationEQ', handleAGVUtilizationEQ);
    connection.value?.onreconnected(async () => {
        console.log('🔁 SignalR 已重新連線')
        if (currentSubscribedSchema && currentTab) {
            await subscribeToSchema(currentSubscribedSchema, currentTab)
            await _Init()
            console.log(`✅ 已重新初始化 Init_${currentTab}`)
        }
    })

    try {
        await subscribeToSchema(realTimeData.selectedAgvc, activeTab.value)
        await _Init()
    } catch (err) {
        console.error('❌ SignalR 錯誤：', err)
    }
    if (activeTab.value !== 'monitor') {
        intervalId = setInterval(() => {
            _Init()
        }, 60 * 60 * 1000) // 每小時
    }
    
    intervalAlive = setInterval(async() => {
        await connection.value?.invoke('GetAliveCheck')
    }, 2 * 1000) 
})

onDeactivated(async () => {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
    
    off('ReceiveNotification', handleNotification)
    off('ReceiveAGVEfficiency', handleAGVEfficiency)
    off('ReceiveAGVUtilization', handleAGVUtilization)
    off('ReceiveTrafficStats', handleReceiveTrafficStats)
    off('ReceiveAliveCheck', handleReceiveAliveCheck)
    off('ReceiveUtilizationEQ', handleAGVUtilizationEQ)

    if (currentSubscribedSchema && currentTab) {
    await connection.value.invoke('AGVCUnsubscribe', currentSubscribedSchema, currentTab)
    console.log(`🔄 取消訂閱: ${currentSubscribedSchema}-${currentTab}`)
    }
})

// const errorMessageVisible = ref(false)

// watch(
//   () => aliveCheck.value,
//   (val) => {
//     if (val && (!val.isAlive || !val.isVMSAlive)) {
//         if (!errorMessageVisible.value) {
//             errorMessageVisible.value = true
//             let messages: string[] = []
//             if (val.isAlive === false) messages.push('連線異常，請檢查設備連線狀態。')
//             if (val.isVMSAlive === false) messages.push('派車系統異常，請檢查VMS系統狀態。')
//                 ElNotification({
//                 title: '警告',
//                 message: messages.join('<br>'),
//                 type: 'warning',
//                 showClose: true,
//                 duration: 0,
//                 position: 'bottom-right',
//                 dangerouslyUseHTMLString: true,
//                 onClose: () => {
//                     errorMessageVisible.value = false
//                 }
//             })
//         }
//     } else {
//       errorMessageVisible.value = false
//     }
//   },
//   { immediate: true, deep: true }
// )

function setUTCDate(targetDate: dayjs.Dayjs, isEnd: boolean): Date {
    return new Date(Date.UTC(
        targetDate.year(),
        targetDate.month(),
        targetDate.date(),
        isEnd ? 23 : 0, 
        isEnd ? 59 : 0, 
        isEnd ? 59 : 0, 
        isEnd ? 999 : 0
    ));
}

const localDateRange = ref(realTimeData.DateRange.map(d => dayjs(d).toDate()) as [Date, Date]);

// 核心：使用 @change 事件來呼叫您的 Action
function handleDateRangeChange(newRange: [Date, Date] | null) {
    if (newRange && newRange.length === 2) {
        
        const startDateLocal = dayjs(newRange[0])
        const endDateLocal = dayjs(newRange[1])

        const newStartDateUTC = setUTCDate(startDateLocal, false)
        const newEndDateUTC = setUTCDate(endDateLocal, true)
        
        // 呼叫 Store Action
        realTimeData.updateDateRange([newStartDateUTC, newEndDateUTC])
    }
}

watch(
  () => realTimeData.AGVC_RealTimeDashboard_SystemAlarms,
  (alarms) => {
    if (alarms.some((alarm: any) => !alarm.Checked)) {
      alarmStore.playAlarm()
    } else {
      alarmStore.stopAlarm()
    }
  },
  { immediate: true, deep: true }
)

</script>


<style scoped>
.h-100 {
  border: 2px solid #444;
  border-radius: 12px;
  padding: 4px;
}
.h-100.not-alive {
  border-color: #fdc84ca4 !important; /* 亮橘色 */
}
.agvc-tabs :deep(.el-tabs__item:first-child) {
    border: none !important;
    background: transparent !important;
    cursor: default !important;
    min-width: 0 !important;
    padding: 0 !important;
}

.agvc-tabs {
    --tab-offset-top: 111px;
    padding: 0 10px;
    margin-bottom: 10px;
}

:deep(#tab-select-agvc) {
    width: 260px;
    padding-left: 5px;

    .select-agvc-container {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .select-agvc-label {
            margin-right: 10px;
            color: #fff;
            font-weight: bold;
            letter-spacing: 2px;
        }

        .el-select {
            width: 180px;
        }
    }
}


.agvc-tabs .tab-content-component {
    height: calc(100vh - var(--tab-offset-top) - 20px);
}

.agvc-tabs :deep(.el-tabs__header) {
    margin: 0;
}

.agvc-tabs :deep(.el-tabs__content) {
    height: calc(100vh - var(--tab-offset-top) + 200px);
    overflow-y: auto;
    /* border: 4px solid #cc00ff; */
}

.agvc-tabs :deep(.el-tabs__nav) {
    border: none;
}

.agvc-tabs :deep(.el-tabs__item) {
    color: #909399;
    border: 1px solid #333;
    margin-right: 4px;
    height: 32px;
    line-height: 32px;
}

.agvc-tabs :deep(.el-tabs__item.is-active) {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #fff;
}

.agvc-tabs :deep(.el-tabs__item:hover) {
    color: #409EFF;
}

.agvc-tabs :deep(.el-tabs__item.is-active:hover) {
    color: #fff;
}

.agvc-tabs :deep(.el-icon) {
    margin-right: 4px;
    vertical-align: middle;
}

.date-select {
    padding: 10px;
    position: absolute;
    top: 44px;
    right: 10px;
}
</style>
