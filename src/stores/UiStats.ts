import { defineStore } from 'pinia'

export const uiStatsStore = defineStore('uiStats', {
    state: () => ({
        isCollapse: false,
        agvcTabSelected: 'monitor',
        routeSelected: 'monitor',
        selectedAgvc: '',
        theme: (typeof localStorage !== 'undefined' && localStorage.getItem('agvc-theme') === 'light') ? 'light' : 'dark',
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
        },
        setSelectedAgvc(value: string) {
            this.selectedAgvc = value
        },
        setTheme(theme: 'dark' | 'light') {
            this.theme = theme
            localStorage.setItem('agvc-theme', theme)
            document.documentElement.classList.toggle('dark', theme === 'dark')
        }
    },
    getters: {
        getCollapse: (state) => state.isCollapse
    }
})
