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
                            <el-select v-model="realTimeData.selectedAgvc">
                                <el-option v-for="item in agvcList" :key="item.value" :label="item.name" :value="item.value" />
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
                    <RealTimeDashboard class="tab-content-component" 
                        @show-equipment-status="handleShowEquipmentStatus" @realtime-action="handleRealtimeAction"/>
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-stats">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>交管狀態</span>
                    </template>
                    <TrafficStatsDashboard class="tab-content-component" ref="TrafficStatsRef"/>
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-efficiency">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>搬運效能統計</span>
                    </template>
                    <TrafficEfficiencyDashboard class="tab-content-component" 
                        @selector-change="() => _Init()" @loadHistoryTasks="loadHistoryTasks" :connection="connection"/>
                </el-tab-pane>
                <el-tab-pane name="utilization" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>設備稼動</span>
                    </template>
                    <UtilizationDashboard class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane name="RackHistory" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>水位紀錄</span>
                    </template>
                    <RackHistory class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane name="battery-records" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>電池紀錄</span>
                    </template>
                    <BatteryRecords class="tab-content-component" ref="BatteryRecordsRef" />
                </el-tab-pane>
                <el-tab-pane name="charge-station" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>充電站資訊</span>
                    </template>
                    <ChargeStationDashboard class="tab-content-component" ref="ChargeStationRef" />
                </el-tab-pane>
                <el-tab-pane name="utilizationEQ" :lazy="true">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>週邊設備</span>
                    </template>
                    <UtilizationEQDashboard class="tab-content-component" @realtime-action="handleUtilizationEQRealtimeAction"/>
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
                size="70%"
                direction="rtl"
                :close-on-click-modal="true"
            >
                <AgvStatus v-if="equipmentType === 'agv'" :id="selectedEquipmentId" @back="showEquipmentDrawer = false"/>
                <RackStatus v-else-if="equipmentType === 'rack'" :id="selectedEquipmentId" @back="showEquipmentDrawer = false"/>
            </el-drawer>

            <div class="date-select" v-if="!['monitor', 'utilizationEQ', 'battery-records', 'charge-station'].includes(activeTab)">
                <el-date-picker v-model="localDateRange" type="daterange" range-separator="至" start-placeholder="開始日期" end-placeholder="結束日期" @change="handleDateRangeChange"/>
                <el-button style="margin: 0px 2px" @click="() => _Init()">查詢</el-button>
            </div>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, markRaw, nextTick } from 'vue'
import { Monitor, List, LocationFilled } from '@element-plus/icons-vue'
import { ElNotification, ElMessage } from 'element-plus'
import ContentContainer from '../components/ContentContainer.vue'
import RealTimeDashboard from '../components/AGVC/RealTimeDashboard/index.vue'
import TrafficStatsDashboard from '../components/AGVC/TrafficStatsDashboard/index.vue'
import TrafficEfficiencyDashboard from '../components/AGVC/TrafficEffiencicyDashboard/index.vue'
import UtilizationDashboard from '../components/AGVC/UtilizationDashboard/index.vue'
import UtilizationEQDashboard from '../components/AGVC/UtilizationEQDashboard/index.vue'
import RackHistory from '@/components/EquipmentStatus/Rack/RackHistory.vue'
import BatteryRecords from '@/components/EquipmentStatus/AGV/BatteryRecords.vue'
import ChargeStationDashboard from '@/components/EquipmentStatus/ChargeStation/index.vue'
import { uiStatsStore } from '../stores/UiStats'
import { realTimeStore } from '../stores/realTime'
import { useSignalR } from '@/composables/useSignalR'
import { getMap } from '@/api/map'
import AgvStatus from '@/components/EquipmentStatus/AGV/index.vue'
import RackStatus from '@/components/EquipmentStatus/Rack/index.vue'
import { useAlarmStore } from '@/stores/alert'
import dayjs from 'dayjs'
import { csvExportAPI } from '@/api/csvExport';
import { getTrafficAvailabilitys, getTransferAvailabilitys, getEqpAvailabilitys, getWipHistory, getBatteryRecords, queryUtilizationEQ, queryHistoryAction } from '@/api/agvc'

const alarmStore = useAlarmStore()
const showEquipmentDrawer = ref(false)
const equipmentType = ref('')
const selectedEquipmentId = ref(null)

const { on, off, connection, isConnected } = useSignalR()

const TrafficStatsRef = ref()
const BatteryRecordsRef = ref()
const ChargeStationRef = ref()
const realTimeData = realTimeStore()
const loading = ref(realTimeData.loading)
const activeTab = ref('monitor')
const uiStats = uiStatsStore()
const agvcList = ref([])
const aliveCheck = ref({ isAlive: true, isVMSAlive: true })
watch(isConnected, async (newVal) => {
    if (newVal && realTimeData.selectedAgvc) {
        console.log('🔗 SignalR 已連線，開始自動訂閱場域...');
        // 確保重新連線後，能自動訂閱並拿取最新資料
        await subscribeToSchema(realTimeData.selectedAgvc, activeTab.value);
        await _Init();
    }
});
// 新增監聽 Store 中 selectedAgvc 的變化
watch(
  () => realTimeData.selectedAgvc,
  async (newVal, oldVal) => {
    // 確保有新值，且新舊值不同時才觸發 (避免初始載入重複觸發)
    if (newVal && oldVal && newVal !== oldVal) {
      await handleAgvcChange(newVal);
    }
  }
);
function handleReceiveChannels(schemas: any) {
    if (!schemas || schemas.length === 0) return;

    // 自動判斷並轉換格式
    const formattedSchemas = schemas.map((item: any) => {
        if (typeof item === 'string') {
            return { name: item, value: item };
        }
        return item; 
    });

    agvcList.value = formattedSchemas;
    
    // 1. 優先使用目前 Store 中的場域 (從 InfoCard 點擊帶過來的)
    let targetAgvc = realTimeData.selectedAgvc;

    // 2. 如果 Store 沒有值，或是不在授權清單內，才嘗試從 localStorage 取得
    if (!targetAgvc || !formattedSchemas.some((item: any) => item.value === targetAgvc)) {
        const savedAgvc = localStorage.getItem('agvc_selected_field');
        targetAgvc = formattedSchemas[0].value;
        if (savedAgvc && formattedSchemas.some((item: any) => item.value === savedAgvc)) {
            targetAgvc = savedAgvc;
        }
    }

    // 核心修正：確保狀態正確賦值並強制重新抓取地圖與資料
    realTimeData.selectedAgvc = targetAgvc;
    handleAgvcChange(targetAgvc);
}

function handleShowEquipmentStatus({ id, type }) {
  equipmentType.value = type
  selectedEquipmentId.value = id
  showEquipmentDrawer.value = true
}
async function handleExportAction(actionName: string, {type, target, dateRange, params}: any) {
    if (type === 'query') {
        // 動態決定要呼叫哪個 SignalR 方法
        try {
            // 將 Date 轉為後端看得懂的字串
            const formattedDateRange = dateRange && dateRange.length >= 2 ? [
                dayjs(dateRange[0]).format('YYYY-MM-DD HH:mm:ss'),
                dayjs(dateRange[1]).format('YYYY-MM-DD HH:mm:ss')
            ] : [];

            if (actionName === 'InitUtilizationEQ') {
                const res = await queryUtilizationEQ(realTimeData.selectedAgvc, target, formattedDateRange, params);
                const data = res?.data || res;
                if (data) {
                    data.target = data.target || target; // 確保 target 不會因為 HTTP 傳輸而遺失
                    handleUtilizationEQ(data);
                }
            } 
            else if (actionName === 'AGVC_Realtime_Action') {
                const res = await queryHistoryAction(realTimeData.selectedAgvc, target, formattedDateRange, params);
                const data = res?.data || res;
                if (data) {
                    data.target = data.target || target;
                    handleReceiveRealtimeAction(data);
                }
            }
        } catch (err) {
            ElMessage.error('查詢資料失敗');
            console.error(err);
            }
    } else {
        try {
            // 1. 呼叫 API
            const res = await csvExportAPI.exportToCsv(
                target, 
                realTimeData.selectedAgvc, 
                dateRange, 
                params // 這裡傳入的是過濾條件物件，對應後端 req.Filters
            );

            // 2. 檢查狀態碼 (204 無資料)
            if (res.status === 204) {
                ElMessage.warning('目前查詢範圍內沒有可匯出的資料');
                return;
            }

            // 3. 獲取檔名 (優化解析邏輯)
            const disposition = res.headers['content-disposition'];
            let fileName = `Tasks_Export_${new Date().getTime()}.csv`; // 預設檔名

            if (disposition) {
                // 使用更精準的正則表達式，排除掉 attachment; 等字眼
                const fileNameMatch = disposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";\n]+)['"]?/i);
                if (fileNameMatch && fileNameMatch[1]) {
                    // 解碼並移除可能的引號
                    fileName = decodeURIComponent(fileNameMatch[1]);
                }
            }

            // 4. 處理 Blob 資料
            // 確保 res.data 是 Blob (這取決於你 request.ts 的攔截器邏輯)
            const blobData = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
            
            const url = window.URL.createObjectURL(blobData);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // 設定下載檔名
            
            document.body.appendChild(link);
            link.click();

            // 5. 資源清理
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            ElMessage.success('檔案準備就緒，開始下載');

        } catch (error: any) {
            console.error('匯出失敗詳情:', error);
            
            // 如果後端回傳錯誤 (如 500)，且 responseType 是 blob，錯誤訊息會被包在 blob 裡
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    const message = JSON.parse(reader.result as string)?.detail || '伺服器產生檔案失敗';
                    ElMessage.error(message);
                };
                reader.readAsText(error.response.data);
            } else {
                ElMessage.error(error.message || '連線伺服器失敗，請檢查網路');
            }
        }
    }
}

// 這樣原本的兩個函式就可以簡化成這樣：
async function handleUtilizationEQRealtimeAction(payload: any) {
    await handleExportAction('InitUtilizationEQ', payload);
}

async function handleRealtimeAction(payload: any) {
    await handleExportAction('AGVC_Realtime_Action', payload);
}

/** 作廢進行中地圖請求，避免切換場域後舊回應覆蓋 */
let mapFetchSeq = 0

function isValidMapModel(data: any): boolean {
    if (!data || typeof data !== 'object') return false
    // 後端可能回 { Map: {...} }，也可能直接回含 Points 的地圖本體
    return !!(data.Map || data.Points)
}

async function fetchMapForAgvc(agvc: string) {
    if (!agvc) {
        realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
        return
    }
    const seq = ++mapFetchSeq
    const requestedAgvc = agvc
    try {
        const mapData = await getMap(requestedAgvc)
        // 場域已切換或有更新的請求：忽略此回應
        if (seq !== mapFetchSeq || realTimeData.selectedAgvc !== requestedAgvc) return
        // 與原先行為一致：只要有回傳資料就採用；結構交由地圖元件解析
        if (mapData) {
            realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', markRaw(mapData))
        } else {
            realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
        }
    } catch (e) {
        console.error('地圖獲取失敗', e)
        if (seq === mapFetchSeq && realTimeData.selectedAgvc === requestedAgvc) {
            realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null)
        }
    }
}

async function loadHistoryTasks(resolve: () => void) {
    try {
        const sel = realTimeData.AGVC_TrafficEfficiency_Selector;
        const currentAgvc = realTimeData.selectedAgvc;
        const formattedDateRange = realTimeData.DateRange && realTimeData.DateRange.length >= 2 ? [
            dayjs(realTimeData.DateRange[0]).format('YYYY-MM-DD HH:mm:ss'),
            dayjs(realTimeData.DateRange[1]).format('YYYY-MM-DD HH:mm:ss')
        ] : [];
        
        // 載入歷史任務時，同步確保地圖已經被抓取；失敗則清空，避免殘留其他場域地圖
        if (!isValidMapModel(realTimeData.AGVC_TrafficStats_mapModel) && currentAgvc) {
            await fetchMapForAgvc(currentAgvc);
        }

        // 繼續獲取歷史任務資料
        const res = await getTransferAvailabilitys(
            currentAgvc, 
            formattedDateRange,
            sel?.unloadEQ, 
            sel?.source,    
            sel?.target,
            true // needTaskList
        );
        const data = res?.data || res;
        if (data) handleAGVEfficiency(data);
    } catch(e) {
        console.error('API Error:', e);
    }
    resolve();
}

async function _Init() {
    const currentTab = activeTab.value;
    // 電池紀錄頁由元件自行 loading，避免全頁遮罩擋住車輛下拉選單
    const usePageLoading = currentTab !== 'battery-records'
    if (usePageLoading) loading.value = true
    const currentRange = realTimeData.DateRange && realTimeData.DateRange.length >= 2 ? [
        dayjs(realTimeData.DateRange[0]).format('YYYY-MM-DD HH:mm:ss'),
        dayjs(realTimeData.DateRange[1]).format('YYYY-MM-DD HH:mm:ss')
    ] : [];
    const currentAgvc = realTimeData.selectedAgvc;
    const sel = realTimeData.AGVC_TrafficEfficiency_Selector;

    try {
        // 統一在這裡詢問地圖 API，只要沒有地圖才去抓，所有頁籤共用；失敗則不顯示地圖
        if (!isValidMapModel(realTimeData.AGVC_TrafficStats_mapModel) && currentAgvc) {
            await fetchMapForAgvc(currentAgvc);
        }

        switch (currentTab) {
            case 'monitor':
                await connection.value?.invoke('InitDataByTab');
                // 這裡不用再 getMap 了！
                break;
            case 'traffic-stats':
                try {
                    await connection.value?.invoke('InitDataByTab');
                    // 這裡不用再 Promise.all 去 getMap 了！只抓交管數據
                    const trafficRes = await getTrafficAvailabilitys(currentAgvc, currentRange);
                    const trafficData = trafficRes?.data || trafficRes;
                    if (trafficData) handleReceiveTrafficStats(trafficData);
                } catch (e) {
                    console.error('API Error in traffic-stats:', e);
                }
                break;
            case 'traffic-efficiency':
                try {
                    const res = await getTransferAvailabilitys(
                        currentAgvc, 
                        currentRange,
                        sel?.unloadEQ, 
                        sel?.source,    
                        sel?.target,
                        false 
                    );
                    const data = res?.data || res;
                    if (data) handleAGVEfficiency(data);
                } catch(e) {
                    console.error('API Error:', e);
                }
                break;
            case 'utilization':
                try {
                    const res = await getEqpAvailabilitys(currentAgvc, currentRange);
                    const data = res?.data || res;
                    if (data) handleAGVUtilization(data);
                } catch(e) {
                    console.error('API Error:', e);
                }
                break;
            case 'utilizationEQ':
                realTimeData.AGVC_UtilizationEQ_deviceData = []
                realTimeData.AGVC_UtilizationEQ_alarmData.data = []
                realTimeData.AGVC_UtilizationEQ_alarmData.total = 0
                break;
            case 'RackHistory':
                try {
                    const res = await getWipHistory(currentAgvc, currentRange);
                    const data = res?.data || res;
                    if (data) handleReceiveRackHistory(data);
                } catch(e) {
                    console.error('API Error:', e);
                }
                break;
            case 'charge-station':
                try {
                    // 即時狀態走 SignalR 推播，歷史資料由元件自行以 API 查詢當日充電區間
                    await connection.value?.invoke('InitDataByTab');
                    await nextTick()
                    if (ChargeStationRef.value?.reloadDefault) {
                        await ChargeStationRef.value.reloadDefault()
                    }
                } catch(e) {
                    console.error('API Error:', e);
                }
                break;
            case 'battery-records':
                try {
                    // 進入頁籤 / 切換場域後：依目前 schema 向後端取 AgvStates 預設車輛與昨日資料
                    await nextTick()
                    if (BatteryRecordsRef.value?.reloadDefault) {
                        await BatteryRecordsRef.value.reloadDefault()
                    } else if (BatteryRecordsRef.value?.loadBySchema) {
                        await BatteryRecordsRef.value.loadBySchema(true)
                    } else {
                        const res = await getBatteryRecords(
                            currentAgvc,
                            '',
                            dayjs().subtract(1, 'day').format('YYYY-MM-DD')
                        )
                        const data = res?.data || res
                        if (data) handleReceiveBatteryRecords(data)
                    }
                } catch(e) {
                    console.error('API Error:', e);
                }
                break;
        }

    } catch (err) {
        console.error(err);
    }

    if (usePageLoading) loading.value = false
}
async function handleAgvcChange(value: string) {
    localStorage.setItem('agvc_selected_field', value);
    
    // 切換場域時立刻清空舊地圖；進行中的請求由 fetchMapForAgvc 的序號自動作廢
    realTimeData.updateRealTimeData('AGVC_TrafficStats_mapModel', null);
    
    await subscribeToSchema(value, activeTab.value)
    await _Init()
    
    realTimeData.resetQueryData();
}
const handleTabChange = async (tab: string) => {
    uiStats.setAGVCTabSelected(tab)
    await subscribeToSchema(realTimeData.selectedAgvc, activeTab.value)
    await _Init()
}
const tabStoreMap: Record<string, Record<string, string>> = {
    "monitor": {
        EQStatus_AGV: "AGVC_RealTimeDashboard_EQStatus_AGV",
        AgvStates: "AGVC_RealTimeDashboard_AgvStates",
        EQStatus_MainEQ: "AGVC_RealTimeDashboard_EQStatus_MainEQ",
        EQStatus_Rack: "AGVC_RealTimeDashboard_EQStatus_Rack",
        Tasks: "AGVC_RealTimeDashboard_Tasks",
        SysStatus: "AGVC_RealTimeDashboard_SysStatus",
        SystemAlarms: "AGVC_RealTimeDashboard_SystemAlarms",
        NoRealTimeTask: "AGVC_RealTimeDashboard_NoRealTimeTask",
        StationStatus: "AGVC_RealTimeDashboard_EQStatus_Rack",
    },
    "traffic-stats": {
        EQStatus_AGV: "AGVC_RealTimeDashboard_EQStatus_AGV",
        AgvStates: "AGVC_RealTimeDashboard_AgvStates",
        SysStatus: "AGVC_RealTimeDashboard_SysStatus"
    },
    "RackHistory": {
        RackHistory: "RackHistory"
    },
    "charge-station": {
        EQStatus_ChargeStation: "AGVC_RealTimeDashboard_EQStatus_ChargeStation"
    }
};

let currentSubscribedSchema: string | null = null
let currentTab: string | null = null

async function subscribeToSchema(schema: string, tab: string) {
    if (!connection.value || !isConnected.value) {
        console.warn(`⚠️ SignalR 尚未連線，無法訂閱 ${schema}-${tab}，將等待連線恢復`);
        return;
    }

    if (currentSubscribedSchema && currentTab) {
        await connection.value?.invoke('AGVCUnsubscribe', currentSubscribedSchema, currentTab)
        console.log(`🔄 取消訂閱: ${currentSubscribedSchema}-${currentTab}`)
    }
    await connection.value?.invoke('AGVCSubscribe', schema, tab)
    currentSubscribedSchema = schema
    currentTab = tab
    console.log(`✅ 已訂閱 schema: ${schema}-${tab}`)
}

function handleNotification(result: any) {
    const storeMap = tabStoreMap[activeTab.value];

    if (!storeMap) return;

    if (['monitor', 'RackHistory', 'traffic-stats', 'charge-station'].includes(activeTab.value)) {
        const type = (result.type || result.Type || '').toLowerCase();
        if (type === 'init') {
            const data = result.data || result.Data || {};
            for (const [key, value] of Object.entries(data)) {
                const mapKey = Object.keys(storeMap).find(k => k.toLowerCase() === key.toLowerCase());
                if (mapKey) {
                    realTimeData.updateRealTimeData(storeMap[mapKey], value);
                }
            }
        } else if (type === 'update') {
            const table = result.table || result.Table || result.target || result.Target;
            const data = result.data !== undefined ? result.data : result.Data;
            const mapKey = Object.keys(storeMap).find(k => k.toLowerCase() === (table || '').toLowerCase());
            if (mapKey) {
                realTimeData.updateRealTimeData(storeMap[mapKey], data);
            }
        }
    }
}

function handleAGVEfficiency(result: any) {
    if (!result) return;
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_TaskSuccess', result.TaskSuccess || result.taskSuccess || 0)
    realTimeData.updateRealTimeData('MainEQList', result.MainEQList || result.mainEQList || [])
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_UnloadWaitTime', result.UnloadWaitTime || result.unloadWaitTime || [])
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_CarryStatics', result.CarryStatics || result.carryStatics || [])
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_TaskList', result.TaskList || result.taskList || [])
    realTimeData.updateRealTimeData('AGVC_TrafficEfficiency_CarryStaticsByPath', result.CarryStaticsByPath || result.carryStaticsByPath || [])
}

function handleAGVUtilization(result: any) {
    if (!result) return;
    const noTasks = result.NoAGVTasks || result.noAGVTasks || {};
    realTimeData.updateRealTimeData('AGVC_Utilization_AGVAvailabilitys', result.AGVAvailabilitys || result.agvAvailabilitys || [])
    realTimeData.updateRealTimeData('AGVC_Utilization_NoAGVTasks', noTasks.NoTasks || noTasks.noTasks || 0)
    realTimeData.updateRealTimeData('AGVC_Utilization_RemoteRate', noTasks.RemoteRate || noTasks.remoteRate || 0)
    realTimeData.updateRealTimeData('AGVC_Utilization_NoReject', noTasks.NoReject || noTasks.noReject || 0)
    realTimeData.updateRealTimeData('AGVC_Utilization_NoAGVAlarm', result.NoAGVAlarm || result.noAGVAlarm || 0)
    realTimeData.updateRealTimeData('AGVC_Utilization_TotalMileage', noTasks.TotalMileage || noTasks.totalMileage || 0)
    realTimeData.updateRealTimeData('AGVC_Utilization_ExchangeCount', noTasks.ExchangeCount || noTasks.exchangeCount || 0)
    realTimeData.updateRealTimeData('AGVC_Utilization_TaskTypeRatio', result.TaskTypeRatio || result.taskTypeRatio || [])
    realTimeData.updateRealTimeData('AGVC_Utilization_TaskAutoRatio', result.TaskAutoRatio || result.taskAutoRatio || [])
}

function handleUtilizationEQ(result: any) {
    if (!result) return;
    const target = result.target || result.Target;
    const payload = result.data || result.Data || result;

    if(target === 'EQUtilization') {
        realTimeData.updateRealTimeData('AGVC_UtilizationEQ_deviceData', payload.deviceData || payload.DeviceData || payload || [])
    }
    if(target === 'EQAlarms') {
        realTimeData.AGVC_UtilizationEQ_alarmData = {
            data: payload.data || payload.Data || (Array.isArray(payload) ? payload : []),
            total: payload.total || payload.Total || 0
        };
    }
}

function handleReceiveAliveCheck(result: any) {
    aliveCheck.value = result
}

function handleReceiveTrafficStats(result: any) {
    if (!result) return;
    const stats = result.tagStopStats || result.TagStopStats || []
    realTimeData.updateRealTimeData('AGVC_TrafficStats_tagStopStats', stats)
    
    const colorMap: Record<string, { color: string, avgdurationseconds: number }> = {}
    stats.forEach((s: any) => {
        const tag = s.tag || s.Tag;
        if (tag === undefined || tag === null) return;
        let color = ''
        const duration = s.avgdurationseconds || s.AvgDurationSeconds || 0;
        if (duration <= 8) color = 'rgba(0,200,83,0.8)'; 
        else if (duration <= 16) color = 'rgba(255,214,0,0.8)'; 
        else if (duration <= 24) color = 'rgba(255,160,0,0.8)'; 
        else if (duration <= 32) color = 'rgba(255,87,34,0.8)'; 
        else color = 'rgba(229,57,53,0.8)'; 
        colorMap[String(tag)] = { color, avgdurationseconds: duration }
    })

    const mapModel: any = realTimeData.AGVC_TrafficStats_mapModel || {};
    const mapData = mapModel?.Points ? mapModel : (mapModel?.Map || {});
    const points = mapData?.Points || {};
    
    Object.values(points).forEach((point: any) => {
        const info = colorMap[String(point.TagNumber)]
        if (info) {
            point.TagStopColor = info.color
            point.TagStopInfo = info 
        } else {
            point.TagStopColor = 'rgba(255,255,255,.2)'
            point.TagStopInfo = null
        }
    })
    
    // ★ 核心修正：將解構後的新物件重新用 markRaw 包裹，再更新至 Store ★
    // 這樣做既能改變物件引用（Reference）觸發地圖元件的 watch 繪製，又能防止 Vue 進去深度監聽導致卡死
    if (realTimeData.AGVC_TrafficStats_mapModel) {
        realTimeData.updateRealTimeData(
            'AGVC_TrafficStats_mapModel', 
            markRaw({ ...realTimeData.AGVC_TrafficStats_mapModel })
        );
    }
    
    const pathStats = result.pathUseStats || result.PathUseStats || []
    const counts = pathStats.map((s: any) => s.count || s.Count || 0)
    const minCount = counts.length ? Math.min(...counts) : 0
    const maxCount = counts.length ? Math.max(...counts) : 0
    const pathUseStatsMap: Record<string, { count: number, color: string }> = {}
    pathStats.forEach((s: any) => {
        const countVal = s.count || s.Count || 0;
        const ratio = maxCount === minCount ? 0 : (countVal - minCount) / (maxCount - minCount)
        const colorSteps = [
            'rgba(0,200,83,0.8)', 'rgba(255,214,0,0.8)', 'rgba(255,160,0,0.8)', 
            'rgba(255,87,34,0.8)', 'rgba(229,57,53,0.8)'
        ]
        let colorIdx = ratio >= 0.8 ? 4 : ratio >= 0.6 ? 3 : ratio >= 0.4 ? 2 : ratio >= 0.2 ? 1 : 0;
        pathUseStatsMap[`${s.tagA || s.TagA}-${s.tagB || s.TagB}`] = { count: countVal, color: colorSteps[colorIdx] }
    })
    realTimeData.updateRealTimeData('AGVC_TrafficStats_pathUseStats', pathUseStatsMap)
}

function handleReceiveRealtimeAction(result: any) {
    if (!result) return;
    const target = result.target || result.Target;
    const payload = result.data || result.Data || result;
    
    const dataArr = Array.isArray(payload.data || payload.Data) 
        ? (payload.data || payload.Data) 
        : (Array.isArray(payload) ? payload : []);

    const newData = {
        data: [...dataArr],
        total: payload.total || payload.Total || dataArr.length || 0
    };
    
    if (target === 'tasks') {
        realTimeData.AGVC_RealTimeDashboard_Query_Tasks = newData;
    } else if (target === 'alarms') {
        realTimeData.AGVC_RealTimeDashboard_Query_Alarms = newData;
    }
}

function handleReceiveRackHistory(result: any) {
    realTimeData.updateRealTimeData('RackHistory', result)
}

function handleReceiveBatteryRecords(result: any) {
    if (!result) return
    realTimeData.updateRealTimeData('BatteryRecords', {
        agvList: result.agvList || result.AgvList || [],
        selectedAgv: result.selectedAgv || result.SelectedAgv || '',
        date: result.date || result.Date || '',
        points: result.points || result.Points || [],
        statusPeriods: result.statusPeriods || result.StatusPeriods || [],
        statusSummary: result.statusSummary || result.StatusSummary || {}
    })
}

let intervalId: ReturnType<typeof setInterval> | null = null
let intervalAlive: ReturnType<typeof setInterval> | null = null
onMounted(async () => {
    // 接收後端推播通知
    on('ReceiveChannels', handleReceiveChannels);
    on('ReceiveNotification', handleNotification);
    on('ReceiveAliveCheck', handleReceiveAliveCheck);
    connection.value?.onreconnected(async () => {
        console.log('🔁 SignalR 已重新連線')
        if (currentSubscribedSchema && currentTab) {
            const schema = currentSubscribedSchema;
            const tab = currentTab;
            currentSubscribedSchema = null;
            currentTab = null;
            await subscribeToSchema(schema, tab)
            await _Init()
            loading.value = false
            ElMessage.success('伺服器重新連線成功')
            console.log(`✅ 已重新初始化 Init_${tab}`)
        }
    })

    connection.value?.onreconnecting((error: any) => {
        console.warn('⚠️ SignalR 正在嘗試重新連線...', error)
        ElMessage.warning('與伺服器連線中斷，正在嘗試重新連線...')
        loading.value = true // 正在重連時顯示 Loading
    })

    connection.value?.onclose((error: any) => {
        console.error('❌ SignalR 連線已完全關閉', error)
        // 重連失敗或被手動關閉，解除卡住的畫面
        loading.value = false
        ElMessage.error('與伺服器連線已中斷，請重整頁面。')
        aliveCheck.value = { isAlive: false, isVMSAlive: false }
    })

    try {
        if (isConnected.value) {
            await connection.value?.invoke('GetChannels');
        }
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

onUnmounted(async () => {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
    if (intervalAlive) {
        clearInterval(intervalAlive)
        intervalAlive = null
    }
    off('ReceiveChannels', handleReceiveChannels);
    off('ReceiveNotification', handleNotification);
    off('ReceiveAliveCheck', handleReceiveAliveCheck);

    if (currentSubscribedSchema && currentTab) {
    await connection.value?.invoke('AGVCUnsubscribe', currentSubscribedSchema, currentTab)
    console.log(`🔄 取消訂閱: ${currentSubscribedSchema}-${currentTab}`)
    }
    
    loading.value = false
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

// 初始化時，嘗試從 localStorage 取得上次儲存的日期範圍
const savedDateRangeStr = localStorage.getItem('agvc_date_range');
if (savedDateRangeStr) {
    try {
        const parsed = JSON.parse(savedDateRangeStr);
        if (Array.isArray(parsed) && parsed.length === 2) {
            const start = new Date(parsed[0]);
            const end = new Date(parsed[1]);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                realTimeData.updateDateRange([start, end]);
            }
        }
    } catch (e) {
        console.error('解析儲存的日期失敗', e);
    }
}

const localDateRange = ref(realTimeData.DateRange.map(d => dayjs(d).toDate()) as [Date, Date]);

// 核心：使用 @change 事件來呼叫您的 Action
function handleDateRangeChange(newRange: [Date, Date] | null) {
    if (newRange && newRange.length === 2) {
        const startDateLocal = dayjs(newRange[0]).startOf('day').toDate();
        const endDateLocal = dayjs(newRange[1]).endOf('day').toDate();
        
        realTimeData.updateDateRange([startDateLocal, endDateLocal]);
        localStorage.setItem('agvc_date_range', JSON.stringify([startDateLocal, endDateLocal]));
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
