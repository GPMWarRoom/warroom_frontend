<template>
    <div class="utilization-dashboard d-flex flex-column pt-2">
        <el-row class="" :gutter="8">
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3 class="d-flex justify-content-between">AGV稼動率 <div class="d-flex justify-content-end">
                        <el-radio-group v-model="selectedAgvUtilizationType" size="small">
                            <el-radio-button value="status" type="primary" @click="selectedAgvUtilizationType = 'status'">依狀態</el-radio-button>
                            <el-radio-button value="odometer" type="primary" @click="selectedAgvUtilizationType = 'odometer'">依里程</el-radio-button>
                        </el-radio-group>
                    </div></h3>
                    
                    <div class="content">
                        <AgvUtilization :selectedUtilizationType="selectedAgvUtilizationType" class="w-100" :datas="[{ name: 'AGV1', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { name: 'AGV2', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV MTBF MTBI</h3>
                    <div class="content">
                        <LineChart class="w-100" :datas="[{ name: 'AGV1', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { name: 'AGV2', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="my-2" :gutter="8">
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV任務數</h3>
                    <div class="content">
                        <LineChart class="w-100" :datas="[{ name: 'AGV1', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { name: 'AGV2', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV上線率 (Remote)</h3>
                    <div class="content">
                        <LineChart class="w-100" :datas="[{ name: 'AGV1', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { name: 'AGV2', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV 警報次數</h3>
                    <div class="content">
                        <LineChart class="w-100" :datas="[{ name: 'AGV1', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { name: 'AGV2', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="" :gutter="8">
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>設備狀態異常而拒絕任務數</h3>
                    <div class="content">
                        <LineChart class="w-100" :datas="[{ name: '拒絕次數', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3>充電站使用率</h3>
                    <div class="content">
                        <LineChart class="w-100" :datas="[{ name: '充電站-1', data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, { name: '充電站-2', data: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120] }]" />
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script setup>
import LineChart from '../../common/charts/LineChart.vue'
import AgvUtilization from './components/AgvUtilization.vue'
import { ref } from 'vue'

const selectedAgvUtilizationType = ref('status')

</script>
<style lang="scss" scoped>
.utilization-dashboard {
    height: 100%;
    width: 100%;

    .el-row {
        height: 33.33%;
    }

    @media (max-width: 768px) {
        .el-col {
            width: 100%;
            height: 200px;
        }
    }
}
</style>
