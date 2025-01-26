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
                    <EChart class="content h-100 w-100" :options="getOption()"></EChart>
                </div>
                <div class="card my-1">
                    <h3>設備Unload平均等待時間</h3>
                    <div class="content text-light">
                        <div class="w-100 bg-light h-100">
                            <EChart class="h-100 w-100" :options="{
                                title: {
                                },
                                xAxis: {
                                    type: 'category',
                                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                                },
                                yAxis: { type: 'value' },
                                series: [{
                                    data: [150, 230, 224, 218, 135, 147, 260],
                                    type: 'line'
                                }],

                            }"></EChart>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" class="h-100">
                <div class="card">
                    <h3>停等狀態統計</h3>
                    <div class="h-100 text-light d-flex flex-column justify-content-between">
                        <div class="w-100 h-100 ">1</div>
                        <div class="w-100 h-100 ">1</div>
                        <div class="w-100 h-100 ">1</div>
                        <div class="w-100 h-100 ">1S</div>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import EChart from '../../components/EChart.vue'

const getOption = () => {
    return {
        title: {
        },
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: { type: 'value' },
        series: [{
            data: [150, 230, 224, 218, 135, 147, 260],
            type: 'line'
        }]
    }
}

onMounted(async () => {
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