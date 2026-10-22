import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { readSession } from '@/composables/useSessionState'
interface SysStatus {
    RunMode: boolean
    HostConnMode: boolean
    HostOperMode: boolean
}
interface Query {
    data: any[]
    total: number
}
export interface AgvcOption {
    name: string
    value: string
}
function calculateInitialDateRange(): [Date, Date] {
    // 使用 dayjs 直接處理本地時間
    const startDate = dayjs().subtract(7, 'day').startOf('day').toDate();
    const endDate = dayjs().subtract(1, 'day').endOf('day').toDate();
    
    return [startDate, endDate];
}
export const realTimeStore = defineStore('realTime', {
    state: () => ({
        loading: false,
        // 自動重新整理後回到原本的場域（AGVC.vue 切換場域時寫入）
        selectedAgvc: readSession<string>('agvc-field', v => typeof v === 'string' && v !== '') ?? 'UMTC_YM_3F_ABF',
        MainEQList: [] as any[],
        AGVC_TrafficEfficiency_Selector: { unloadEQ:"all", source:"Rack", target:"" },
        AGVC_RealTimeDashboard_EQStatus_AGV: [] as any[],
        AGVC_RealTimeDashboard_EQStatus_MainEQ: [] as any[],
        AGVC_RealTimeDashboard_EQStatus_Rack: [] as any[],
        AGVC_RealTimeDashboard_Tasks: [] as any[],
        AGVC_RealTimeDashboard_Query_Tasks: {
            data: [],
            total: 0
        } as Query,
        AGVC_RealTimeDashboard_Query_Alarms: {
            data: [],
            total: 0
        } as Query,
        AGVC_RealTimeDashboard_SysStatus: [] as SysStatus[],
        AGVC_RealTimeDashboard_SystemAlarms: [] as any[],
        AGVC_RealTimeDashboard_NoRealTimeTask: [] as any[],
        AGVC_TrafficEfficiency_TaskSuccess: [] as any[],
        AGVC_TrafficEfficiency_UnloadWaitTime: [] as any[],
        AGVC_TrafficEfficiency_CarryStatics: [] as any[],
        AGVC_TrafficEfficiency_TaskList: [] as any[],
        AGVC_TrafficEfficiency_CarryStaticsByPath: [] as any[],
        AGVC_Utilization_TaskTypeRatio: [] as any[],
        AGVC_Utilization_TaskAutoRatio: [] as any[],
        AGVC_Utilization_AGVAvailabilitys: [] as any[],
        AGVC_Utilization_NoAGVTasks: [] as any[],
        AGVC_Utilization_RemoteRate: [] as any[],
        AGVC_Utilization_NoReject: [] as any[],
        AGVC_Utilization_ExchangeCount: [] as any[],
        AGVC_Utilization_NoAGVAlarm: [] as any[],
        AGVC_Utilization_TotalMileage: [] as any[],
        AGVC_TrafficStats_tagStopStats: [] as any[],
        AGVC_TrafficStats_pathUseStats: [] as any[],
        AGVC_UtilizationEQ_deviceData: [] as any[],
        AGVC_UtilizationEQ_alarmData: {
            data: [],
            total: 0
        } as Query,
        Overview_Data: [] as any[],
        RackHistory: [] as any[],
        BatteryRecords: {
            agvList: [] as string[],
            selectedAgv: '',
            date: '',
            points: [] as any[],
            statusPeriods: [] as any[],
            statusSummary: {} as Record<string, number>
        },
        AGVC_RealTimeDashboard_EQStatus_ChargeStation: [] as any[],
        ChargeStationRecords: {
            stationList: [] as string[],
            selectedStation: '',
            date: '',
            usageCount: 0,
            sessions: [] as any[],
            selectedSessionId: null as number | null,
            points: [] as any[]
        },
        AGVC_TrafficStats_mapModel: null as any,
        DateRange: calculateInitialDateRange() as [Date, Date],
        // 場域清單（後端 ReceiveChannels 推來），場域資訊與 LOG 撈取共用
        agvcList: [] as AgvcOption[],
    }),

    actions: {
        updateRealTimeData(key: string, value: any) {
            if (key in this) {
                (this as any)[key] = value
            }
        },
        // **建議新增一個 action 來更新 dateRange**
        updateDateRange(newRange: [Date, Date]) {
            if (!newRange || newRange.length < 2) return;

            // 使用 dayjs 強制校正邊界，避免 UI 元件帶入奇怪的分秒或 UTC 偏移
            const start = dayjs(newRange[0]).startOf('day').toDate();
            const end = dayjs(newRange[1]).endOf('day').toDate();
            
            this.DateRange = [start, end];
        },
        /** 存入後端回傳的場域清單；字串格式自動轉成 { name, value } */
        setAgvcList(schemas: any[]): AgvcOption[] {
            this.agvcList = (schemas || []).map((item: any) =>
                typeof item === 'string' ? { name: item, value: item } : item
            )
            return this.agvcList
        },
        resetQueryData() {
            this.AGVC_RealTimeDashboard_Query_Tasks = {
                data: [],
                total: 0
            }; 
            this.AGVC_RealTimeDashboard_Query_Alarms = {
                data: [],
                total: 0
            }; 
        }
    },
    getters: {

    }
    
})
