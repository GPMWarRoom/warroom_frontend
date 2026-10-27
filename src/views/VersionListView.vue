<template>
    <div class="version-container">
        <div class="header">
            <h1 class="title">版本管理</h1>
            <div class="view-switch">
                <span class="floor-label">樓層</span>
                <el-select v-model="selectedFloor" placeholder="選擇樓層" size="large" class="floor-select">
                    <el-option v-for="floor in versionList" :key="floor.floor" :label="`${floor.floor} F`" :value="floor.floor" />
                </el-select>
                <el-radio-group v-model="viewType" size="large">
                    <el-radio-button label="tree">樹狀圖</el-radio-button>
                    <el-radio-button label="table">表格</el-radio-button>
                </el-radio-group>
            </div>
        </div>
        <!-- 樹狀圖視圖：一次只顯示下拉選單選的樓層 -->
        <div v-if="viewType === 'tree'" class="trees-container">
            <div v-show="selectedFloorData" class="tree-wrapper">
                <h2 class="floor-title">{{ selectedFloorData?.floor }} F</h2>
                <div ref="treeChartRef" class="tree-chart"></div>
            </div>
        </div>
        <!-- 表格視圖：與樹狀圖共用同一個樓層選單 -->
        <div v-else class="tables-container">
            <div v-if="selectedFloorData" class="table-wrapper">
                <h2 class="floor-title">{{ selectedFloorData.floor }} F</h2>
                <el-table :data="getTableData(selectedFloorData)" border>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick, onActivated, onDeactivated } from 'vue'
import type { FloorVersions } from '@api/system'
import * as echarts from 'echarts'
import { useSignalR } from '@/composables/useSignalR'
import { useSessionRef } from '@/composables/useSessionState'
import { uiStatsStore } from '@/stores/UiStats'
const { on, off, connection } = useSignalR()

const viewType = ref<'tree' | 'table'>('tree')
const versionList = ref<FloorVersions[]>([])
// 樹狀圖與表格共用選的樓層，自動重新整理後保留
const selectedFloor = useSessionRef<number | null>('version-floor', null, v => typeof v === 'number')
const selectedFloorData = computed(() => versionList.value.find(floor => floor.floor === selectedFloor.value))
const treeChartRef = ref<HTMLElement | null>(null)
let treeChart: echarts.ECharts | null = null

function handleReceiveVersion(result: FloorVersions[]) {
    versionList.value = result
    // 沒選過或選的樓層已不存在時，預設第一個樓層
    if (result.length && !result.some(floor => floor.floor === selectedFloor.value)) {
        selectedFloor.value = result[0].floor
    }
}

onActivated(async () => {
    on('ReceiveVersion', handleReceiveVersion)
    await connection.value?.invoke('InitVersion')
})

onDeactivated(() => {
    off('ReceiveVersion', handleReceiveVersion)
})

const uiStats = uiStatsStore()
const chartTextColor = () => uiStats.theme === 'light' ? '#141414' : '#ffffff'

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
                color: chartTextColor(),
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
                    color: chartTextColor(),
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

/** 畫出目前選的樓層；換樓層時整份取代，不與上一個樓層的節點合併 */
const renderTree = () => {
    const el = treeChartRef.value
    const floor = selectedFloorData.value
    if (viewType.value !== 'tree' || !el || !floor) return
    if (!treeChart || treeChart.getDom() !== el) {
        treeChart?.dispose()
        treeChart = echarts.init(el)
    }
    treeChart.setOption(createChartOption(floor), true)
    treeChart.resize()
}

const disposeTree = () => {
    treeChart?.dispose()
    treeChart = null
}

watch(selectedFloorData, () => nextTick(renderTree))
watch(() => uiStats.theme, () => nextTick(renderTree))

const handleResize = () => {
    treeChart?.resize()
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

onMounted(() => {
    window.addEventListener('resize', handleResize)
    nextTick(renderTree)
})

// 監聽視圖類型變化
watch(viewType, (newType) => {
    if (newType === 'tree') {
        nextTick(renderTree)
    } else {
        disposeTree()
    }
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    disposeTree()
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

.view-switch {
    display: flex;
    align-items: center;
    gap: 10px;
}

.floor-label {
    color: var(--text-color);
    font-weight: bold;
    letter-spacing: 2px;
    white-space: nowrap;
}

.floor-select {
    width: 140px;
    margin-right: 10px;
}

.title {
    color: var(--text-color);
    margin: 0;
}

.trees-container {
    padding: 20px;
}

.tree-wrapper {
    background: var(--card-bg);
    border: 1px solid var(--card-border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--glass-shadow);
    padding: 10px;
    margin-bottom: 10px;
}

.floor-title {
    color: var(--text-color);
    text-align: center;
    margin-bottom: 20px;
}

.tree-chart {
    width: 100%;
    /* 一次只顯示一個樓層，圖表撐滿可視高度 */
    height: calc(100vh - 260px);
    min-height: 400px;
}

.tables-container {
    padding: 20px;
}

.table-wrapper {
    background: var(--card-bg);
    border: 1px solid var(--card-border-color);
    border-radius: var(--radius-card);
    box-shadow: var(--glass-shadow);
    padding: 20px;
    margin-bottom: 20px;
}

:deep(.el-table) {
    background: transparent;
}

:deep(.el-table th) {
    background: var(--table-header-bg);
    color: var(--text-muted);
}


:deep(.el-table td) {
    background: transparent;
    color: var(--text-color);
}

:deep(.el-table--border) {
    border-color: var(--border-color);
}


:deep(.el-table--border th),
:deep(.el-table--border td) {
    border-color: var(--border-color);
}
</style>