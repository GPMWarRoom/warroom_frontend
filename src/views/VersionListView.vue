<template>
    <div class="version-container">
        <div class="header">
            <h1 class="title">版本管理</h1>
            <div class="view-switch">
                <el-radio-group v-model="viewType" size="large">
                    <el-radio-button label="tree">樹狀圖</el-radio-button>
                    <el-radio-button label="table">表格</el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <!-- 樹狀圖視圖 -->
        <div v-if="viewType === 'tree'" class="trees-container">
            <div v-for="floor in versionList" :key="floor.floor" class="tree-wrapper">
                <h2 class="floor-title">{{ floor.floor }} F</h2>
                <div :ref="el => setChartRef(el as Element, floor.floor)" class="tree-chart"></div>
            </div>
        </div>
        <!-- 表格視圖 -->
        <div v-else class="tables-container">
            <div v-for="floor in versionList" :key="floor.floor" class="table-wrapper">
                <h2 class="floor-title">{{ floor.floor }} F</h2>
                <el-table :data="getTableData(floor)" border>
                    <el-table-column prop="fieldName" label="場域名稱" />
                    <el-table-column prop="fieldVersion" label="派車系統版本" />
                    <el-table-column label="車輛版本">
                        <template #default="{ row }">
                            <el-table :data="row.vehicles" border size="small">
                                <el-table-column prop="name" label="名稱" />
                                <el-table-column prop="version" label="版本" />
                            </el-table>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { systemApi } from '@/api'
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { FloorVersions } from '@api/system'
import * as echarts from 'echarts'

const viewType = ref<'tree' | 'table'>('tree')
const versionList = ref<FloorVersions[]>([])
const chartInstances = new Map<number, echarts.ECharts>()

const setChartRef = (el: Element | null, floor: number) => {
    if (el && el instanceof HTMLElement) {
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
                    if (params.value) {
                        return `${params.name} : ${params.value}`
                    } else {
                        return params.name
                    }
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

// 表格數據轉換
const getTableData = (floor: FloorVersions) => {
    return floor.fieldVersions.map(field => ({
        fieldName: field.name,
        fieldVersion: field.version,
        vehicles: field.vehiclesVersions.map(vehicle => ({
            name: vehicle.name,
            version: vehicle.version
        }))
    }))
}

onMounted(async () => {
    const res = await systemApi.getVersionList()
    versionList.value = res
    if (viewType.value === 'tree') {
        setTimeout(initCharts, 200)
        setTimeout(handleResize, 200)
        window.addEventListener('resize', handleResize)
    }
})

// 監聽視圖類型變化
watch(viewType, (newType) => {
    if (newType === 'tree') {
        nextTick(() => {
            initCharts()
            handleResize()
            window.addEventListener('resize', handleResize)
        })
    } else {
        window.removeEventListener('resize', handleResize)
        chartInstances.forEach(chart => {
            chart.dispose()
        })
        chartInstances.clear()
    }
})

onUnmounted(() => {
    if (viewType.value === 'tree') {
        window.removeEventListener('resize', handleResize)
        chartInstances.forEach(chart => {
            chart.dispose()
        })
    }
})
</script>
<style scoped>
.version-container {
    padding: 10px;
    overflow-y: auto;
    height: 100%;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 0 20px;
}

.title {
    color: #ffffff;
    margin: 0;
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

.tables-container {
    padding: 20px;
}

.table-wrapper {
    background: #3030307e;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

:deep(.el-table) {
    background: transparent;
}

:deep(.el-table th) {
    background: var(--version-view-table-color);
    color: white;
}


:deep(.el-table td) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

:deep(.el-table--border) {
    border-color: var(--version-view-table-color);
}


:deep(.el-table--border th),
:deep(.el-table--border td) {
    border-color: var(--version-view-table-color);
}
</style>