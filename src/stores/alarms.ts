import { defineStore } from 'pinia'

interface AlarmMessage {
    id: number;
    message: string;
    level: 'info' | 'warning' | 'error';
    timestamp: Date;
}

export const alarmStore = defineStore('alarm', {
    state: () => ({
        alarms: [
            {
                id: 1,
                message: "AGV-01 低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告低電量警告",
                level: "warning",
                timestamp: new Date("2024-01-10T08:30:00")
            },
            {
                id: 2, 
                message: "3F 區域交通壅塞",
                level: "error",
                timestamp: new Date("2024-01-10T08:45:00")
            },
            {
                id: 3,
                message: "AGV-03 完成任務",
                level: "info", 
                timestamp: new Date("2024-01-10T09:00:00")
            }
        ] as AlarmMessage[],
        isActive: false
    }),

    actions: {
        addAlarm(message: string, level: 'info' | 'warning' | 'error' = 'info') {
            const alarm: AlarmMessage = {
                id: Date.now(),
                message,
                level,
                timestamp: new Date()
            }
            this.alarms.push(alarm)
            this.isActive = true
        },

        removeAlarm(id: number) {
            this.alarms = this.alarms.filter(alarm => alarm.id !== id)
            if (this.alarms.length === 0) {
                this.isActive = false
            }
        },

        clearAlarms() {
            this.alarms = []
            this.isActive = false
        }
    },

    getters: {
        getAlarms: (state) => state.alarms,
        hasActiveAlarms: (state) => state.isActive,
        getLatestAlarm: (state) => state.alarms[state.alarms.length - 1]
    }
})
