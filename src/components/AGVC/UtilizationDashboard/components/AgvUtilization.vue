<template>
    <div class="agv-utilization">
        <StackedBarChart v-if="selectedUtilizationType === 'status'" :datas="{ xData: chartData.xData,
            groups: chartData.groups,
            stacks: chartData.stacks,
            yDataList: chartData.yDataList,
            originalDataList: chartData.originalDataList }" />
        <LineChart v-if="selectedUtilizationType === 'odometer'" :datas="datas" />
    </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import StackedBarChart from '../../../common/charts/StackedBarChart.vue';
import LineChart from '../../../common/charts/LineChart.vue';
import { realTimeStore } from '@/stores/realTime'
const realTimeData = realTimeStore()

const props = defineProps({
    datas: {
        type: Array,
        required: true
    },
    selectedUtilizationType: {
        type: String,
        required: true
    }
})

const chartData = computed(() => {
    const raw = realTimeData.AGVC_Utilization_AGVAvailabilitys
    const groups = [...new Set(raw.map(r => r.AGVName))]
    const xData = [...new Set(raw.map(r => r.Date.slice(0, 10)))]
    const stacks = ['RUN_TIME', 'IDLE_TIME', 'DOWN_TIME', 'CHARGE_TIME', 'UNKNOWN_TIME']

    const yDataList = []
    const originalDataList = []

    groups.forEach(group => {
        const groupData = stacks.map(() => [])
        const groupOriginal = stacks.map(() => [])

        xData.forEach(date => {
        const record = raw.find(r => r.AGVName === group && r.Date.startsWith(date))
        const total = record
            ? stacks.reduce((sum, key) => sum + record[key], 0)
            : 0

        stacks.forEach((key, i) => {
            const value = record ? record[key] : 0
            groupOriginal[i].push(value)
            groupData[i].push(total > 0 ? +(value / total * 100).toFixed(1) : 0)
        })
        })

        yDataList.push(groupData)
        originalDataList.push(groupOriginal)
    })

    return {
        xData,
        groups,
        stacks,
        yDataList,
        originalDataList
    }
})


</script>
<style lang="scss" scoped>
.agv-utilization {
    width: 100%;
    height: 100%;
}
</style>