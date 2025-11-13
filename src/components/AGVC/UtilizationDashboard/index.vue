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
                    <h3 class="d-flex justify-content-between">AGV稼動率
                        <div class="d-flex justify-content-end">
                            <el-select v-if="selectedAgvUtilizationType === 'status'" v-model="agvUtilizationIndex" size="small" style="width:120px">
                                <el-option v-for="(g, i) in agvUtilizationGroups" :key="g" :label="g" :value="i" />
                            </el-select>
                            <el-radio-group v-model="selectedAgvUtilizationType" size="small" style="margin-left: 8px;">
                                <el-radio-button value="status" type="primary">依狀態</el-radio-button>
                                <el-radio-button value="odometer" type="primary">依里程</el-radio-button>
                            </el-radio-group>
                        </div>
                    </h3>
                    <div class="content">
                        <AgvUtilization :selectedUtilizationType="selectedAgvUtilizationType" class="w-100"
                            :currentIndex="agvUtilizationIndex"
                        />
                    </div>
                </div>
            </el-col>
            <el-col :lg="12" :md="12" :sm="24">
                <div class="card">
                    <h3 class="d-flex justify-content-between">AGV MTBF
                        <div class="d-flex justify-content-end">
                            <span style="margin-right:8px;margin-top: 2.5px;">計算週期:</span>
                            <el-input-number v-model="mtbfPeriod" :min="1" :max="30" size="small" style="width:80px" />
                            <span style="margin-left:8px;margin-top: 2.5px;">天</span>
                        </div>
                    </h3>
                    <div class="content">
                        <LineChart :useGradient="true" :yAxisName="'小時'"
                            :datas="[{
                                name: 'MTBF',
                                xData: filteredMTBFList.xData,
                                yData: filteredMTBFList.yData
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
const mtbfGroupIndex = ref(0)
const agvUtilizationIndex = ref(0)
const agvUtilizationType = ref('status')
const agvUtilizationGroups = computed(() => {
    const raw = realTimeData.AGVC_Utilization_AGVAvailabilitys || [];
    if (!raw.length) return ['Total'];
    const groups = [...new Set(raw.map(r => r.AGVName))];
    groups.push('Total');
    return groups;
})

const MTBFList = computed(() => {
    const raw = realTimeData.AGVC_Utilization_AGVAvailabilitys || [];
    const alarmRaw = realTimeData.AGVC_Utilization_NoAGVAlarm || [];
    if (!raw.length) return { xData: [], yData: [] };

    const xData = [...new Set(raw.map(r => r.Date.slice(0, 10)))];
    const yData = [];

    xData.forEach(date => {
        const agvRecords = raw.filter(r => r.Date.startsWith(date));
        const alarmRecords = alarmRaw.filter(r => r.Date.startsWith(date));
        const runTime = agvRecords.reduce((sum, rec) => sum + (rec.RUN_TIME || 0), 0);
        const count = alarmRecords.reduce((sum, rec) => sum + (rec.Count || 0), 0);
        let mtbf = null;
        if (count > 0) mtbf = +(runTime / count / 3600).toFixed(2); // 秒轉小時
        yData.push(mtbf);
    });

    return { xData, yData };
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
    0: 'Move', 
    1: 'Unload', 
    7: 'Load', 
    8: 'Charge', 
    9: 'Carry', 
    12: 'Park'
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
const mtbfPeriod = ref(1)
const filteredMTBFList = computed(() => {
    const raw = realTimeData.AGVC_Utilization_AGVAvailabilitys || [];
    const alarmRaw = realTimeData.AGVC_Utilization_NoAGVAlarm || [];
    if (!raw.length) return { xData: [], yData: [] };
    const xData = [...new Set(raw.map(r => r.Date.slice(0, 10)))];
    const resultX = [];
    const resultY = [];
    let i = 0;
    while (i < xData.length) {
        const periodDates = xData.slice(i, i + mtbfPeriod.value);
        const agvRecords = raw.filter(r => periodDates.includes(r.Date.slice(0, 10)));
        const alarmRecords = alarmRaw.filter(r => periodDates.includes(r.Date.slice(0, 10)));
        const runTime = agvRecords.reduce((sum, rec) => sum + (rec.Run || 0), 0);
        const count = alarmRecords.reduce((sum, rec) => sum + (rec.Count || 0), 0);
        let mtbf = null;
        if (count > 0) mtbf = +(runTime / count / 3600).toFixed(2);
        else mtbf = 0;
        resultX.push(periodDates[periodDates.length - 1]);
        resultY.push(mtbf);
        i += mtbfPeriod.value;
    }
    return { xData: resultX, yData: resultY };
})
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
