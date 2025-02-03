import { defineStore } from 'pinia'

export const uiStatsStore = defineStore('uiStats', {
    state: () => ({
        isCollapse: false,
        agvcTabSelected: 'monitor',
        routeSelected: 'monitor'
    }),

    actions: {
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        setCollapse(value: boolean) {
            this.isCollapse = value
        },
        setAGVCTabSelected(value: string) {
            this.agvcTabSelected = value
        },
        setRouteSelected(value: string) {
            this.routeSelected = value
        }
    },
    getters: {
        getCollapse: (state) => state.isCollapse
    }
})
