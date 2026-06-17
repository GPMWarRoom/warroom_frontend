<template>
    <el-row :gutter="20" class="wip-level-container">
        <el-col :span="12" class="chart-col">
            <el-card class="box-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>WIP 水位變化</span>
                    </div>
                </template>
                <div class="chart-wrapper">
                    <LineChart 
                        v-if="chartData.length > 0"
                        :datas="chartData" 
                        xAxisName="時間" 
                        yAxisName="水位" 
                        title="" 
                    />
                </div>
            </el-card>
        </el-col>
        <el-col :span="12" class="list-col">
            <el-card class="box-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>WIP 水位紀錄</span>
                    </div>
                </template>
                <el-table :data="tableData" style="width: 100%" height="calc(100vh - 280px)">
                    <el-table-column prop="name" label="WIP 名稱" width="180" />
                    <el-table-column prop="level" label="水位" />
                    <el-table-column prop="updateTime" label="更新時間" />
                </el-table>
            </el-card>
        </el-col>
    </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LineChart from '@/components/common/charts/LineChart.vue'
const chartData = ref([
    {
        name: 'WIP-A',
        xData: ['2026-06-02 10:00', '2026-06-02 11:00', '2026-06-02 12:00', '2026-06-02 13:00', '2026-06-02 14:00', '2026-06-02 15:00'],
        yData: [12, 15, 14, 18, 20, 19]
    },
    {
        name: 'WIP-B',
        xData: ['2026-06-02 10:00', '2026-06-02 11:00', '2026-06-02 12:00', '2026-06-02 13:00', '2026-06-02 14:00', '2026-06-02 15:00'],
        yData: [8, 9, 11, 10, 12, 14]
    }
])

const tableData = ref([
    { name: 'WIP-A', level: 19, updateTime: '2026-06-02 10:50:00' },
    { name: 'WIP-B', level: 14, updateTime: '2026-06-02 10:50:00' },
    { name: 'WIP-C', level: 5, updateTime: '2026-06-02 10:40:00' }
])

onMounted(() => {
    // 初始化羋輯
})
</script>

<style scoped>
.wip-level-container {
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
}
.chart-col, .list-col {
    height: 100%;
}
.box-card {
    height: 100%;
    display: flex;
    flex-direction: column;
}
:deep(.el-card__body) {
    flex: 1;
    overflow: hidden;
    padding: 10px;
}
.chart-wrapper {
    height: 100%;
    width: 100%;
}
</style>