import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { defaultMapModel } from '@/models/MapModel'
import { reset } from 'ol/transform'
interface SysStatus {
    RunMode: boolean
    HostConnMode: boolean
    HostOperMode: boolean
}
interface Query {
    data: any[]
    total: number
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
        selectedAgvc: 'UMTC_YM_3F_ABF',
        MainEQList: [] as any[],
        AGVC_TrafficEfficiency_Selector: { unloadEQ:"all", source:"Rack", target:"MainEQ" },
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
        AGVC_RealTimeDashboard_NoRealTimeTasks: [] as any[],
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
        AGVC_UtilizationEQ_alarmData: [] as any[],
        Overview_Data: [] as any[],
        AGVC_TrafficStats_mapModel: defaultMapModel as typeof defaultMapModel,
        DateRange: calculateInitialDateRange() as [Date, Date],
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
