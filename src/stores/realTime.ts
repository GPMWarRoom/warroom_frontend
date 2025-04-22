import { defineStore } from 'pinia'

interface SysStatus {
    RunMode: boolean
    HostConnMode: boolean
    HostOperMode: boolean
  }

export const realTimeStore = defineStore('realTime', {
    state: () => ({
        AGVC_RealTimeDashboard_EQStatus_AGV: [] as any[],
        AGVC_RealTimeDashboard_EQStatus_MainEQ: [] as any[],
        AGVC_RealTimeDashboard_EQStatus_Rack: [] as any[],
        AGVC_RealTimeDashboard_Tasks: [] as any[],
        AGVC_RealTimeDashboard_SysStatus: [] as SysStatus[],
        AGVC_RealTimeDashboard_SystemAlarms: [] as any[],
        AGVC_TrafficEfficiency_Tasks: [] as any[],
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
