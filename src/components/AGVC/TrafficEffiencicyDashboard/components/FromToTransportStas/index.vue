<template>
    <div class="from-to-transport-stats h-100 d-flex flex-column">
        <FromToSelector @selector-change="handleSelectorChange" />
        <div class="flex-fill d-flex flex-column justify-content-between position-relative">
            <h3>搬運結果</h3>
            <div class="h-100">
                <MixBarLineChart :datas="{
                        xData: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.Date),
                        barSeries: [
                            { name: '完成', data: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.CompletedCount) },
                            { name: '失敗', data: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.FailedCount) },
                            { name: '取消', data: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.CanceledCount) }
                        ],
                        lineSeries: [
                            { name: '執行時間', data: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.AvgExecMinutes) },
                            { name: '等待時間', data: realTimeData.AGVC_TrafficEfficiency_CarryStatics.map(item => item.AvgQuMinutes) }
                        ],
                        yAxisBarName: '件數',
                        yAxisLineName: '執行時間(分)'
                    }" 
                    :barWidth="8"
                />
            </div>
            <h3>執行時間 Box Plot</h3>
            <div class="h-100">
                <BoxPlotChart :useGradient="true" :datas="{
                    name: '執行時間(分)', 
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
            
            <div class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center" 
                 style="background: var(--el-bg-color, #141414); top: 0; left: 0; z-index: 10;" 
                 v-if="!realTimeData.AGVC_TrafficEfficiency_CarryStatics || realTimeData.AGVC_TrafficEfficiency_CarryStatics.length === 0">
                <el-empty description="查無資料" />
            </div>
        </div>
    </div>
</template>
<script setup>
import FromToSelector from './FromToSelector.vue'
import MixBarLineChart from '../../../../common/charts/MixBarLineChart.vue';
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
        margin-block: 2px;
    }
}
</style>