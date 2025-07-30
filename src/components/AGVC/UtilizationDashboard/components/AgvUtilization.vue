<template>
    <div class="agv-utilization">
        <StackedBarChart v-if="selectedUtilizationType === 'status'" :datas="{ xData: chartData.xData,
            groups: chartData.groups,
            stacks: chartData.stacks,
            yDataList: chartData.yDataList,
            originalDataList: chartData.originalDataList }"
            :barWidth="8" />
        <LineChart v-if="selectedUtilizationType === 'odometer'" :yAxisName="'公里'" :datas="realTimeData.AGVC_Utilization_TotalMileage"/>
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
            // 找出所有該 group、該日期的資料
            const records = raw.filter(r => r.AGVName === group && r.Date.startsWith(date))
            // 對每個 stack 做加總
            const stackValues = stacks.map(key =>
                records.reduce((sum, rec) => sum + (rec[key] || 0), 0)
            )
            stackValues.forEach((value, i) => groupOriginal[i].push(value))
            const total = stackValues.reduce((sum, v) => sum + v, 0)
            stackValues.forEach((value, i) => {
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