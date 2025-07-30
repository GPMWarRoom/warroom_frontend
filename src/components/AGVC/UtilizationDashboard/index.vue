<template>
    <div class="utilization-dashboard d-flex flex-column pt-2">
        <el-row class="my-1" :gutter="8">
            <el-col :lg="12" :md="12" :sm="12">
                <div class="card">
                    <h3>命令來源</h3>
                    <div class="content">
                        <PieChart :datas="TaskAutoRatioData"/>
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" :md="12" :sm="12">
                <div class="card">
                    <h3>運載方式</h3>
                    <div class="content">
                        <PieChart :datas="TaskTypeRatioData"/>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="my-1" :gutter="8">
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
                        <LineChart  :useGradient="true" :yAxisName="'時間'"
                            :datas="[{
                                name: 'MTBI',
                                xData: MTBFList.map(item => item.date),
                                yData: MTBFList.map(item => item.mtbi !== null ? Number(item.mtbi) : null)
                            }]"/>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="my-1" :gutter="8">
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV任務數</h3>
                    <div class="content">
                        <LineChart class=" w-100" :yAxisName="'任務數(件)'" :datas="realTimeData.AGVC_Utilization_NoAGVTasks"></LineChart>
                    </div>
                </div>
            </el-col>
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV上線率 (Remote)</h3>
                    <div class="content">
                        <LineChart class=" w-100" :yAxisName="'上線率'" :datas="realTimeData.AGVC_Utilization_RemoteRate"></LineChart>
                    </div>
                </div>
            </el-col>
            <el-col :lg="8" :md="12" :sm="24">
                <div class="card">
                    <h3>AGV 警報次數</h3>
                    <div class="content">
                        <LineChart class=" w-100" :yAxisName="'次數'" :datas="[{ name:'警報次數', 
                            xData:realTimeData.AGVC_Utilization_NoAGVAlarm.map(item => item.Date),
                            yData:realTimeData.AGVC_Utilization_NoAGVAlarm.map(item => item.Count) }]"></LineChart>
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="my-1" :gutter="8">
            <el-col :lg="12" :md="12" :sm="12">
                <div class="card">
                    <h3>設備狀態異常而拒絕任務數</h3>
                    <div class="content">
                        <LineChart class="w-100" :yAxisName="'次數'" :datas="realTimeData.AGVC_Utilization_NoReject" />
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" :md="12" :sm="12">
                <div class="card">
                    <h3>AGV交換命令次數</h3>
                    <div class="content">
                        <LineChart class="w-100" :yAxisName="'次數'" :datas="realTimeData.AGVC_Utilization_ExchangeCount" />
                    </div>
                </div>
            </el-col>
        </el-row>
        <el-row class="my-1" :gutter="8" v-if="false">
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
import PieChart from '../../common/charts/PieChart.vue'
import AgvUtilization from './components/AgvUtilization.vue'
import { ref, computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'

const selectedAgvUtilizationType = ref('status')
const realTimeData = realTimeStore()

const MTBFList = computed(() => {
    return realTimeData.AGVC_Utilization_AGVAvailabilitys.map(item => {
        const alarm = realTimeData.AGVC_Utilization_NoAGVAlarm.find(w => w.Date === item.Date)
        const count = Number(alarm?.Count) || 0
        const runTime = Number(item.RUN_TIME) || 0
        let mtbi = 0
        if (runTime > 0) {
            mtbi = count / runTime
        }
        return {
            date: item.Date,
            mtbi: mtbi.toFixed(2)
        }
    })
})
const MTBIList = computed(() => {
    return realTimeData.AGVC_Utilization_AGVAvailabilitys.map(item => {
        const alarm = realTimeData.AGVC_Utilization_NoAGVAlarm.find(w => w.Date === item.Date)
        const count = Number(alarm?.Count) || 0
        const runTime = Number(item.RUN_TIME) || 0
        let mtbi = 0
        if (runTime > 0) {
            mtbi = count / runTime
        }
        return {
            date: item.Date,
            mtbi: mtbi.toFixed(2)
        }
    })
})

const actionMap = {
    0: '移動', 
    1: '取貨', 
    7: '放貨', 
    8: '充電', 
    9: '搬運', 
}

const TaskTypeRatioData = computed(() =>
    (realTimeData.AGVC_Utilization_TaskTypeRatio || []).map(item => ({
        name: actionMap[item.Action] || `Action ${item.Action}`,
        value: item.Count
    }))
)

const TaskAutoRatioData = computed(() =>
    (realTimeData.AGVC_Utilization_TaskAutoRatio || []).map(item => ({
        name: item.Type,
        value: item.Count
    }))
)

</script>
<style lang="scss" scoped>
.utilization-dashboard {
    height: 100%;
    width: 100%;
    overflow-y: auto;

    .card .content {
        min-height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .el-col {
            width: 100%;
            height: 160px;
        }
        .card .content {
            min-height: 160px;
        }
    }
    .my-1 {
        margin-top: 4px !important;
        margin-bottom: 4px !important;
    }
}
</style>
