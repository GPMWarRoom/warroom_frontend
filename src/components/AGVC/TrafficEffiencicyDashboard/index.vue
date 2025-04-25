<template>
    <div class="traffic-efficiency-dashboard">
        <el-row class="w-100 h-100" :gutter="10">
            <el-col :lg="12" class="cards-container d-flex flex-column justify-content-between ">
                <div class="d-flex w-100 mb-1 justify-content-between gap-2">
                    <div class="card w-100" style="height:130px">
                        <h3>平均任務成功率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="realTimeData.AGVC_TrafficEfficiency_Tasks[0]?.AvgSuccessRate" :stroke-width="8" :width="70"></el-progress>
                        </div>
                    </div>
                    <div class="card w-100" style="height:130px">
                        <h3>自動化比率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="realTimeData.AGVC_TrafficEfficiency_Tasks[0]?.AvgAutoRate" :stroke-width="8" :width="70"></el-progress>
                        </div>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>任務成功率走勢</h3>
                    <div class="content w-100 ">
                        <LineChart class="content h-100 w-100" :datas="[{name: '任務成功率', xData:realTimeData.AGVC_TrafficEfficiency_Tasks.map(item => item.Date), 
                            yData:realTimeData.AGVC_TrafficEfficiency_Tasks.map(item => item.DailySuccessRate)}]"></LineChart>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>設備Unload平均等待時間</h3>
                    <div class="content w-100  d-flex flex-column ">
                        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ" class="mb-2" >
                            <el-option
                                label="全部設備"
                                value="all"
                            />
                            <el-option
                                v-for="item in realTimeData.MainEQList"
                                :label="item.Name"
                                :value="item.Name"
                            />
                        </el-select>
                        <BarChart class="content flex-fill h-100 w-100" :useGradient="true" 
                            :datas="[{ name: '平均等待時間', xData:realTimeData.AGVC_TrafficEfficiency_UnloadWaitTime.map(item => item.Date), 
                                yData:realTimeData.AGVC_TrafficEfficiency_UnloadWaitTime.map(item => item.AvgUnloadTime)}]">
                        </BarChart>
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" class="h-100">
                <div class="card">
                    <h3>From-To 統計數據</h3>
                    <div class="h-100 text-light d-flex flex-column justify-content-between">
                        <FromToTransportStas />
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, onUnmounted, ref } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import LineChart from '../../common/charts/LineChart.vue'
import BarChart from '../../common/charts/BarChart.vue'
import FromToTransportStas from './components/FromToTransportStas/index.vue'

const props = defineProps({
  connection: Object // 接收父頁面傳遞過來的 connection
})
const realTimeData = realTimeStore()
const data = reactive({
    lineChartData: [100, 90, 80, 70, 60, 50, 30],
    barChartData: [100, 90, 80, 70, 60, 50, 30]
})
const intervalId = ref<number | null>(null)
const timeoutId = ref<number | null>(null)

onMounted(() => {
    const now = new Date()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const msToNextHour = ((60 - minutes - 1) * 60 + (60 - seconds)) * 1000

    timeoutId.value = window.setTimeout(() => {
        props.connection?.invoke('InitAGVEfficiency', realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ, 
            realTimeData.AGVC_TrafficEfficiency_Selector.source, realTimeData.AGVC_TrafficEfficiency_Selector.target);
        intervalId.value = window.setInterval(() => {
            props.connection?.invoke('InitAGVEfficiency', realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ, 
                realTimeData.AGVC_TrafficEfficiency_Selector.source, realTimeData.AGVC_TrafficEfficiency_Selector.target);
        }, 60 * 60 * 1000)
    }, msToNextHour)
})

onUnmounted(() => {
    if (timeoutId.value !== null) clearTimeout(timeoutId.value)
    if (intervalId.value !== null) clearInterval(intervalId.value)
    
})

</script>
<style scoped lang="scss">
.traffic-efficiency-dashboard {
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    display: flex;

    @media (max-width: 768px) {
        .cards-container {
            margin-bottom: 10px;

            .card {
                height: 180px;
            }
        }
    }

}
</style>