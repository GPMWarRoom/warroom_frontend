import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { defaultMapModel } from '@/models/MapModel'
interface SysStatus {
    RunMode: boolean
    HostConnMode: boolean
    HostOperMode: boolean
  }

export const realTimeStore = defineStore('realTime', {
    state: () => ({
        loading: false,
        selectedAgvc: 'UMTC_YM_3F_ABF',
        MainEQList: [] as any[],
        AGVC_TrafficEfficiency_Selector: { unloadEQ:"all", source:"AGV", target:"MainEQ" },
        AGVC_RealTimeDashboard_EQStatus_AGV: [] as any[],
        AGVC_RealTimeDashboard_EQStatus_MainEQ: [] as any[],
        AGVC_RealTimeDashboard_EQStatus_Rack: [] as any[],
        AGVC_RealTimeDashboard_Tasks: [] as any[],
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
        Overview_Data: [] as any[],
        AGVC_TrafficStats_mapModel: defaultMapModel as typeof defaultMapModel,
        DateRange: [
            dayjs().subtract(60, 'day').toDate(),
            dayjs().toDate()
          ] as [Date, Date],
    }),

    actions: {
        updateRealTimeData(key: string, value: any) {
            if (key in this) {
              (this as any)[key] = value
            }
        }
    },
    getters: {

    }
    
})
