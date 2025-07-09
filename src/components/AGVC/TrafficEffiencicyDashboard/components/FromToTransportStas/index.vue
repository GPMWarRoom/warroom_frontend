<template>
    <div class="from-to-transport-stats h-100 d-flex flex-column">
        <FromToSelector @selector-change="handleSelectorChange" />
        <div class="flex-fill d-flex flex-column justify-content-between">
            <h3>搬運結果</h3>
            <div class="h-100">
                <StackedBarChart :datas="{ stacks: ['完成', '失敗', '取消'],
                    xData: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.Date),
                    groups:['agv_001'],
                    yDataList: [[realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.CompletedCount),
                        realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.FailedCount),
                        realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.CanceledCount)]] }" />
            </div>
            <h3>執行時間</h3>
            <div class="h-100">
                <BarChart :useGradient="true" :yAxisName="'執行時間(分)'"
                    :datas="[{ name: '執行時間', xData:realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.Date), 
                        yData:realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.AvgExecMinutes) }]"/>
            </div>
            <h3>執行時間 Box Plot</h3>
            <div class="h-100">
                <BoxPlotChart :useGradient="true" :datas="{
                    name: '執行時間', 
                    xData: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.Date), 
                    yDataList: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => [
                    item.MinExecMinutes, 
                    item.Q1, 
                    item.Median, 
                    item.Q3, 
                    item.MaxExecMinutes
                    ])
                }"/>
            </div>
        </div>
    </div>
</template>
<script setup>
import FromToSelector from './FromToSelector.vue'
import BarChart from '../../../../common/charts/BarChart.vue';
import StackedBarChart from '../../../../common/charts/StackedBarChart.vue';
import BoxPlotChart from '../../../../common/charts/BoxPlotChart.vue';
import { realTimeStore } from '@/stores/realTime'
const realTimeData = realTimeStore()

const emit = defineEmits(['selector-change'])
function handleSelectorChange() {
  emit('selector-change')
}

</script>
<style lang="scss" scoped>
.from-to-transport-stats {
    h3 {
        margin: 0;
        border-bottom:none;
        margin-block: 10px;
    }
}
</style>