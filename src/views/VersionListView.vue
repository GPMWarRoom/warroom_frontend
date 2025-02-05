<template>
    <div class="version-container">
        <h1 class="title">版本管理</h1>
        <div class="trees-container">
            <div v-for="floor in versionList" :key="floor.floor" class="tree-wrapper">
                <h2 class="floor-title">{{ floor.floor }} F</h2>
                <div :ref="el => setChartRef(el, floor.floor)" class="tree-chart"></div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { systemApi } from '@/api'
import { ref, onMounted, onUnmounted } from 'vue'
import type { FloorVersions } from '@api/system'
import * as echarts from 'echarts'

const versionList = ref<FloorVersions[]>([])
const chartInstances = new Map<number, echarts.ECharts>()

const setChartRef = (el: HTMLElement | null, floor: number) => {
    if (el) {
        const chart = echarts.init(el)
        chartInstances.set(floor, chart)
    }
}

const createChartOption = (floorData: FloorVersions) => {
    return {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
        },
        series: [{
            type: 'tree',
            data: [{
                name: `${floorData.floor}樓版本管理`,
                children: floorData.fieldVersions.map(fieldVersion => ({
                    name: fieldVersion.name,
                    value: fieldVersion.version,
                    children: fieldVersion.vehiclesVersions.map(vehicleVersion => ({
                        name: vehicleVersion.name,
                        value: vehicleVersion.version
                    }))
                }))
            }],
            layout: 'orthogonal',
            orient: 'LR',
            label: {
                position: 'center',
                verticalAlign: 'middle',
                align: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                offset: [0, -20],
                color: 'white',
                formatter: (params: any) => {
                    return `${params.name}_${params.value || ''}`
                }
            },
            leaves: {
                label: {
                    position: 'center',
                    verticalAlign: 'middle',
                    align: 'center',
                    fontSize: 16,
                    color: 'white',
                    fontWeight: 'bold',
                    offset: [60, 5]
                },
                itemStyle: {
                    color: '#409eff',
                    borderColor: '#409eff',
                    borderWidth: 2
                },
                lineStyle: {
                    width: 2
                }
            },
            emphasis: {
                focus: 'descendant'
            },
            expandAndCollapse: true,
            initialTreeDepth: 2,
            animationDuration: 250,
            animationDurationUpdate: 250
        }]
    }
}

const initCharts = () => {
    versionList.value.forEach(floor => {
        const chart = chartInstances.get(floor.floor)
        if (chart) {
            chart.setOption(createChartOption(floor))
        }
    })
}

const handleResize = () => {
    chartInstances.forEach(chart => {
        chart.resize()
    })
}

onMounted(async () => {
    const res = await systemApi.getVersionList()
    versionList.value = res
    setTimeout(initCharts, 200)
    setTimeout(handleResize, 200)
    window.addEventListener('resize', handleResize)
})


onUnmounted(() => {
    chartInstances.forEach(chart => {
        chart.dispose()
    })
    window.removeEventListener('resize', handleResize)
})
</script>
<style scoped>
.version-container {
    padding: 10px;
    overflow-y: auto;
    height: 100%;
}

.title {
    color: #303133;
    margin-bottom: 30px;
    text-align: center;
}

.trees-container {
    padding: 20px;
}

.tree-wrapper {
    background: #3030307e;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 10px;
    margin-bottom: 10px;
}

.floor-title {
    color: #ffffff;
    text-align: center;
    margin-bottom: 20px;
}

.tree-chart {
    width: 100%;
    height: 400px;
}
</style>