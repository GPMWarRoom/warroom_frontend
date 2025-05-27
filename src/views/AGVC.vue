<template>
    <content-container>
        <div class="h-100 ">
            <el-tabs v-model="activeTab" class="agvc-tabs" type="card" v-loading="loading" @tab-change="handleTabChange">
                <el-tab-pane :disabled="true" name="select-agvc">
                    <template #label>
                        <div class="select-agvc-container">
                            <el-icon>
                                <LocationFilled />
                            </el-icon>
                            <span class="select-agvc-label">場域</span>
                            <el-select v-model="selectedAgvc" @change="handleAgvcChange">
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
                    <RealTimeDashboard v-if="activeTab === 'monitor'" class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-stats">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>交管狀態</span>
                    </template>
                    <TrafficStatsDashboard v-if="activeTab === 'traffic-stats'" class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-efficiency">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>搬運效能統計</span>
                    </template>
                    <TrafficEfficiencyDashboard v-if="activeTab === 'traffic-efficiency'" class="tab-content-component" :connection="connection"/>
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
            <div class="date-select" v-if="activeTab !== 'monitor'">
                <el-date-picker v-model="realTimeData.DateRange" type="daterange" range-separator="至" start-placeholder="開始日期" end-placeholder="結束日期" />
                <el-button style="margin: 0px 2px" @click="_Init">查詢</el-button>
            </div>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Monitor, List, LocationFilled } from '@element-plus/icons-vue'
import ContentContainer from '../components/ContentContainer.vue'
import RealTimeDashboard from '../components/AGVC/RealTimeDashboard/index.vue'
import TrafficStatsDashboard from '../components/AGVC/TrafficStatsDashboard/index.vue'
import TrafficEfficiencyDashboard from '../components/AGVC/TrafficEffiencicyDashboard/index.vue'
import UtilizationDashboard from '../components/AGVC/UtilizationDashboard/index.vue'
import { uiStatsStore } from '../stores/UiStats'
import { realTimeStore } from '../stores/realTime'
import { useSignalR } from '@/composables/useSignalR'
const { startConnection, on, off, connection, isConnected } = useSignalR()

const realTimeData = realTimeStore()
const loading = ref(realTimeData.loading)
const activeTab = ref('monitor')
const uiStats = uiStatsStore()
const agvcList = ref([
    {
        id: 1,
        name: '3F-ABF',
        value: "YM_3F_ABF"
    },
    {
        id: 2,
        name: '3F-MEC',
        value: "UMTC_YM_3F_MEC"
    },
    {
        id: 3,
        name: '3F-AOI',
        value: "UMTC_YM_3F_AOI"
    },
    {
        id: 4,
        name: '4F-ABF',
        value: "UMTC_YM_4F_ABF"
    },
    {
        id: 5,
        name: '4F-MEC',
        value: "UMTC_YM_4F_MEC"
    },
    {
        id: 6,
        name: '4F-AOI',
        value: "UMTC_YM_4F_AOI"
    },
    {
        id: 7,
        name: '4F-AOI',
        value: "UMTC_YM_4F_AOI"
    },
    {
        id: 8,
        name: '5F-ABF',
        value: "UMTC_YM_5F_ABF"
    },
    {
        id: 9,
        name: '5F-MEC',
        value: "UMTC_YM_5F_MEC"
    },
    {
        id: 10,
        name: '5F-AOI',
        value: "UMTC_YM_5F_AOI"
    },
    {
        id: 11,
        name: '5F-AOI',
        value: "UMTC_YM_5F_AOI"
    },
    {
        id: 12,
        name: 'yel',
        value: "yel"
    },
])
const selectedAgvc = ref('yel')
async function _Init() {
    switch (activeTab.value) {
        case 'monitor':
            await connection.value?.invoke('InitDataByTab');
            break;
        case 'traffic-efficiency':
            await connection.value?.invoke('InitAGVEfficiency', 
                realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ, 
                realTimeData.AGVC_TrafficEfficiency_Selector.source,    
                realTimeData.AGVC_TrafficEfficiency_Selector.target,
                realTimeData.DateRange
            );
            break;
        case 'utilization':
        await connection.value?.invoke('InitAGVUtilization', 
            realTimeData.DateRange
        );
        break;
    }
}
async function handleAgvcChange(value: string) {
    loading.value = true
    await subscribeToSchema(value, activeTab.value)
    await _Init()
    loading.value = false
}
const handleTabChange = async (tab: string) => {
    uiStats.setAGVCTabSelected(tab)
    await subscribeToSchema(selectedAgvc.value, activeTab.value)
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

onMounted(async () => {
    // loading.value = true

    await startConnection()

    // 接收後端推播通知
    on('ReceiveNotification', (result) => {
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
    });
    on('ReceiveAGVEfficiency', (result) => {
        realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_Tasks', result.TaskSuccess.Result)
        realTimeData.updateRealTimeData('MainEQList', result.MainEQList.Result)
        realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_UnloadWaitTime', result.UnloadWaitTime.Result)
        realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_CarryStatics', result.CarryStatics.Result)
    });
    on('ReceiveAGVUtilization', (result) => {
        realTimeData.updateRealTimeData('AGVC_Utilization_AGVAvailabilitys', result.AGVAvailabilitys.Result)
        realTimeData.updateRealTimeData('AGVC_Utilization_NoAGVTasks', result.NoAGVTasks.Result.NoTasks)
        realTimeData.updateRealTimeData('AGVC_Utilization_RemoteRate', result.NoAGVTasks.Result.RemoteRate)
        realTimeData.updateRealTimeData('AGVC_Utilization_NoAGVAlarm', result.NoAGVAlarm.Result)
        realTimeData.updateRealTimeData('AGVC_Utilization_NoReject', result.NoAGVTasks.Result.NoReject)
        console.log(result.NoAGVTasks.Result.NoReject)
    });
    connection.value?.onreconnected(async () => {
        console.log('🔁 SignalR 已重新連線')
        if (currentSubscribedSchema && currentTab) {
            await subscribeToSchema(currentSubscribedSchema, currentTab)
            await _Init()
            console.log(`✅ 已重新初始化 Init_${currentTab}`)
        }
    })

    try {
        await subscribeToSchema(selectedAgvc.value, activeTab.value)
        await _Init()
    } catch (err) {
        console.error('❌ SignalR 錯誤：', err)
    }

    // loading.value = false
})

</script>


<style scoped>
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
    height: calc(100vh - var(--tab-offset-top));
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
    top: 38px;
    right: 0;
}
</style>
