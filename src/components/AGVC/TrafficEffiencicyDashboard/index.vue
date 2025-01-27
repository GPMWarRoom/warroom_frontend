<template>
    <div class="traffic-efficiency-dashboard">
        <el-row class="w-100 h-100" :gutter="10">
            <el-col :lg="12" class="cards-container d-flex flex-column justify-content-between ">
                <div class="d-flex w-100 mb-1 justify-content-between gap-2">
                    <div class="card w-100" style="height:130px">
                        <h3>平均任務成功率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="55" :stroke-width="8" width="70"></el-progress>
                        </div>
                    </div>
                    <div class="card w-100" style="height:130px">
                        <h3>自動化比率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="55" :stroke-width="8" width="70"></el-progress>
                        </div>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>任務成功率走勢</h3>
                    <div class="content w-100 ">
                        <LineChart class="content h-100 w-100" :data="data.lineChartData"></LineChart>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>設備Unload平均等待時間</h3>
                    <div class="content w-100  d-flex flex-column ">
                        <el-select placeholder="請選擇" class="mb-2"></el-select>
                        <BarChart class="content flex-fill h-100 w-100" :useGradient="true" :data="data.barChartData" xAxisName="時間"></BarChart>
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
<script setup>
import { reactive, onMounted } from 'vue'
import LineChart from '../../common/charts/LineChart.vue'
import BarChart from '../../common/charts/BarChart.vue'
import FromToTransportStas from './components/FromToTransportStas/index.vue'
const data = reactive({
    lineChartData: [100, 90, 80, 70, 60, 50, 30],
    barChartData: [100, 90, 80, 70, 60, 50, 30]
})



onMounted(async () => {
    setInterval(() => {
        data.lineChartData[0] = Math.random() * 100;
    }, 1000)
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