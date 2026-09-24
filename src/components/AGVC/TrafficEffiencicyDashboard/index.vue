<template>
    <div class="traffic-efficiency-dashboard">
        <el-row class="w-100 h-100" :gutter="10">
            <el-col :lg="12" class="cards-container d-flex flex-column justify-content-between ">
                <div class="d-flex w-100 mb-1 justify-content-between gap-2">
                    <div class="card w-100" style="height:130px">
                        <h3>平均任務成功率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="realTimeData.AGVC_TrafficEfficiency_TaskSuccess[0]?.AvgSuccessRate" :stroke-width="8" :width="70"></el-progress>
                        </div>
                    </div>
                    <div class="card w-100" style="height:130px">
                        <h3>自動化比率</h3>
                        <div class="text-light text-center p-2">
                            <el-progress type="circle" :percentage="realTimeData.AGVC_TrafficEfficiency_TaskSuccess[0]?.AvgAutoRate" :stroke-width="8" :width="70"></el-progress>
                        </div>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>任務成功率走勢</h3>
                    <div class="content w-100 ">
                        <LineChart class="content h-100 w-100" :datas="[{name: '任務成功率', xData:realTimeData.AGVC_TrafficEfficiency_TaskSuccess.map(item => item.Date), 
                            yData:realTimeData.AGVC_TrafficEfficiency_TaskSuccess.map(item => item.DailySuccessRate)}]"></LineChart>
                    </div>
                </div>
                <div class="card my-1">
                    <h3>設備Unload平均等待時間</h3>
                    <div class="content w-100  d-flex flex-column ">
                        <el-select v-model="realTimeData.AGVC_TrafficEfficiency_Selector.unloadEQ" 
                            @change="handleSelectorChange" class="mb-2" >
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
            <el-col :lg="12" class="cards-container d-flex flex-column justify-content-between "  style="height: 100%;">
                <div class="card ">
                    <h3>From-To 統計數據</h3>
                    <div class="h-100 text-light d-flex flex-column justify-content-between" >
                        <FromToTransportStas @selector-change="handleSelectorChange"/>
                    </div>
                </div>
                <div class="card my-1" style="flex: 1 1 0; min-height: 180px;">
                    <h3>啟終點執行時間 Box Plot</h3>
                    <div class="h-100">
                        <BoxPlotChart :useGradient="true" :datas="{
                            name: '執行時間(分)', 
                            xData: carryStaticsBoxPlotData.xData, 
                            yDataList: carryStaticsBoxPlotData.yDataList
                        }"/>
                    </div>
                </div>
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import LineChart from '../../common/charts/LineChart.vue'
import BarChart from '../../common/charts/BarChart.vue'
import BoxPlotChart from '../../common/charts/BoxPlotChart.vue';
import FromToTransportStas from './components/FromToTransportStas/index.vue'

const emit = defineEmits(['selector-change'])
function handleSelectorChange() {
  emit('selector-change')
}

const realTimeData = realTimeStore()

const carryStaticsBoxPlotData = computed(() => {
    const source = realTimeData.AGVC_TrafficEfficiency_Selector.source;
    const target = realTimeData.AGVC_TrafficEfficiency_Selector.target;
    
    let filtered = realTimeData.AGVC_TrafficEfficiency_CarryStaticsByPath || [];
    
    const checkIsRack = (name: string) => {
        if (!name) return false;
        if (name.includes('轉換站')) return false;
        return /^WIP[\d\-_]*/i.test(name) || name.toUpperCase().includes('RACK');
    };

    const checkIsAGV = (name: string) => {
        if (!name) return false;
        return name.toUpperCase().includes('AGV');
    };
    
    filtered = filtered.filter(item => {
        let fromName = item.FromName;
        let toName = item.ToName;
        
        if (!fromName && !toName && item.Path) {
            if (item.Path.includes('->')) {
                const parts = item.Path.split('->');
                fromName = parts[0].trim();
                toName = parts[1].trim();
            } else if (item.Path.includes('-')) {
                const parts = item.Path.split('-');
                if (parts.length === 2) {
                    fromName = parts[0].trim();
                    toName = parts[1].trim();
                }
            }
        }
        
        if (!fromName || !toName) return true;
        
        let matchSource = true;
        let matchTarget = true;
        
        if (source === 'AGV') {
            matchSource = item.FromType === 'AGV' || checkIsAGV(fromName);
        } else if (source === 'Rack') {
            matchSource = item.FromType === 'Rack' || checkIsRack(fromName);
        } else if (source) {
            matchSource = fromName && (fromName === source || fromName.startsWith(source));
        }
        
        if (target === 'Rack') {
            matchTarget = item.ToType === 'Rack' || checkIsRack(toName);
        } else if (target) {
            matchTarget = toName && (toName === target || toName.startsWith(target));
        }
        
        return matchSource && matchTarget;
    });

    const grouped = new Map();

    filtered.forEach(item => {
        let xLabel = item.ToName;
        if (!xLabel && item.Path) {
            if (item.Path.includes('->')) {
                xLabel = item.Path.split('->').pop()?.trim() || item.Path;
            } else if (item.Path.includes('-')) {
                const parts = item.Path.split('-');
                if (parts.length === 2) {
                    xLabel = parts[1].trim();
                }
            }
        }
        if (!xLabel) xLabel = item.Path;

        if (checkIsRack(xLabel)) {
            const match = xLabel.match(/^(?:WIP|RACK)[\-_]?(\d+)/i);
            if (match) {
                const prefixMatch = xLabel.match(/^(WIP[\-_]?\d+)/i);
                if (prefixMatch) {
                    xLabel = prefixMatch[1].toUpperCase();
                } else {
                    xLabel = `WIP-${match[1]}`;
                }
            }
        }

        if (!grouped.has(xLabel)) {
            grouped.set(xLabel, []);
        }
        grouped.get(xLabel).push(item);
    });

    const xData: string[] = [];
    const yDataList: number[][] = [];

    grouped.forEach((items, label) => {
        xData.push(label);
        
        if (items.length === 1) {
            const item = items[0];
            yDataList.push([
                item.MinExecMinutes, 
                item.Q1, 
                item.Median, 
                item.Q3, 
                item.MaxExecMinutes
            ]);
        } else {
            const min = Math.min(...items.map((i: any) => i.MinExecMinutes));
            const max = Math.max(...items.map((i: any) => i.MaxExecMinutes));
            const q1 = Number((items.reduce((sum: number, i: any) => sum + i.Q1, 0) / items.length).toFixed(2));
            const median = Number((items.reduce((sum: number, i: any) => sum + i.Median, 0) / items.length).toFixed(2));
            const q3 = Number((items.reduce((sum: number, i: any) => sum + i.Q3, 0) / items.length).toFixed(2));
            
            yDataList.push([min, q1, median, q3, max]);
        }
    });

    return { xData, yDataList };
});
</script>
<style scoped lang="scss">
.traffic-efficiency-dashboard {
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    overflow: hidden;
    
    /* 美化 scrollbar */
    &::-webkit-scrollbar {
        width: 8px;
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: #444a;
        border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: #409effa0;
    }

    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #444a transparent;

    @media (max-width: 768px) {
        .cards-container {
            margin-bottom: 10px;

            .card {
                height: 160px;
            }
        }
    }

}
</style>