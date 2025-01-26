import { defineStore } from 'pinia'

export const uiStatsStore = defineStore('uiStats', {
    state: () => ({
        isCollapse: true
    }),

    actions: {
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        setCollapse(value: boolean) {
            this.isCollapse = value
        }
    },
    getters: {
        getCollapse: (state) => state.isCollapse
    }
})
