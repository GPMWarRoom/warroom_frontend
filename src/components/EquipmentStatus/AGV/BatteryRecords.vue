<template>
    <div class="battery-records">
        <div class="card">
            <h3 class="flex-header">
                <span>AGV 電池紀錄</span>
                <div class="filters">
                    <el-radio-group v-model="viewMode" size="small" class="mode-group">
                        <el-radio-button value="single">單圖</el-radio-button>
                        <el-radio-button value="multi">多圖</el-radio-button>
                    </el-radio-group>
                    <el-checkbox v-model="showStatusBackground" size="small" class="status-check">
                        狀態背景
                    </el-checkbox>
                    <el-select
                        v-model="selectedAgv"
                        size="small"
                        :placeholder="agvList.length ? '選擇車輛' : '此場域無 AgvStates 車輛'"
                        style="width: 160px;"
                        filterable
                        clearable
                        :teleported="true"
                        :loading="loading"
                        @change="onAgvChange"
                    >
                        <el-option v-for="agv in agvList" :key="agv" :label="agv" :value="agv" />
                    </el-select>
                    <el-date-picker
                        v-model="selectedDate"
                        type="date"
                        size="small"
                        placeholder="選擇日期"
                        value-format="YYYY-MM-DD"
                        style="width: 150px;"
                        :teleported="true"
                        @change="onFilterChange"
                    />
                    <el-button size="small" type="primary" :loading="loading" @click="onFilterChange">
                        查詢
                    </el-button>
                </div>
            </h3>
            <div class="content chart-wrapper" v-loading="loading">
                <div class="status-legend" v-if="hasChartData || Object.keys(statusSummary).length">
                    <span class="legend-title">狀態</span>
                    <span v-for="item in statusLegend" :key="item.key" class="legend-item">
                        <i class="swatch" :style="{ background: item.bg, borderColor: item.color }" />
                        {{ item.label }}
                        <span v-if="statusSummary[item.key]" class="legend-count">({{ statusSummary[item.key] }})</span>
                    </span>
                    <span v-if="!Object.keys(statusSummary).length" class="legend-empty">此日無 RealTimeAvailabilitys 重疊資料</span>
                </div>

                <!-- 單圖模式 -->
                <BatteryLineChart
                    v-if="viewMode === 'single' && hasChartData"
                    :datas="singleChartData"
                    :status-periods="activeStatusPeriods"
                    :show-status-background="showStatusBackground"
                    :xAxisName="'時間'"
                    :yAxisName="'電壓 / 電流'"
                    :levelAxisName="'電量%'"
                    class="w-100 h-100"
                />

                <!-- 多圖模式：電量 / 電壓 / 充電電流 / 放電電流 -->
                <div v-else-if="viewMode === 'multi' && hasChartData" class="multi-grid">
                    <div v-for="panel in multiPanels" :key="panel.key" class="multi-panel">
                        <BatteryLineChart
                            :datas="panel.datas"
                            :status-periods="activeStatusPeriods"
                            :show-status-background="showStatusBackground"
                            :single-y-axis="true"
                            :compact="true"
                            :title="panel.title"
                            :yAxisName="panel.yAxisName"
                            class="w-100 h-100"
                        />
                    </div>
                </div>

                <el-empty v-else description="無電池紀錄資料" class="w-100 h-100" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import BatteryLineChart from '@/components/common/charts/BatteryLineChart.vue'
import { AGV_STATUS_COLORS, AGV_STATUS_BG } from '@/utils/agvStatusColors.js'
import { realTimeStore } from '@/stores/realTime'
import { getBatteryRecords } from '@/api/agvc'

const realTimeData = realTimeStore()
const loading = ref(false)
const selectedAgv = ref('')
const selectedDate = ref(dayjs().subtract(1, 'day').format('YYYY-MM-DD'))
const agvList = ref<string[]>([])
const boundSchema = ref('')
const viewMode = ref<'single' | 'multi'>('single')
const showStatusBackground = ref(true)

const statusLegend = [
    { key: 'initializing', label: 'initializing', color: AGV_STATUS_COLORS.initializing, bg: AGV_STATUS_BG.initializing },
    { key: 'idle', label: 'idle', color: AGV_STATUS_COLORS.idle, bg: AGV_STATUS_BG.idle },
    { key: 'run', label: 'run', color: AGV_STATUS_COLORS.run, bg: AGV_STATUS_BG.run },
    { key: 'down', label: 'down', color: AGV_STATUS_COLORS.down, bg: AGV_STATUS_BG.down },
    { key: 'charging', label: 'charging', color: AGV_STATUS_COLORS.charging, bg: AGV_STATUS_BG.charging }
]

const payload = computed(() => realTimeData.BatteryRecords || {
    agvList: [],
    selectedAgv: '',
    date: '',
    points: [],
    statusPeriods: [],
    statusSummary: {} as Record<string, number>
})

const statusPeriods = computed(() => payload.value.statusPeriods || [])
const statusSummary = computed(() => payload.value.statusSummary || {})
const activeStatusPeriods = computed(() =>
    showStatusBackground.value ? statusPeriods.value : []
)

type SeriesItem = {
    key: string
    name: string
    xData: string[]
    xTimestamps: number[]
    yData: (number | null)[]
    color: string
    isLevel?: boolean
}

const seriesBundle = computed(() => {
    const points = payload.value.points || []
    if (!points.length) {
        return {
            xData: [] as string[],
            xTimestamps: [] as number[],
            voltage1: [] as (number | null)[],
            voltage2: [] as (number | null)[],
            charge1: [] as (number | null)[],
            charge2: [] as (number | null)[],
            discharge1: [] as (number | null)[],
            discharge2: [] as (number | null)[],
            level: [] as (number | null)[]
        }
    }

    const xData: string[] = []
    const xTimestamps: number[] = []
    const voltage1: (number | null)[] = []
    const voltage2: (number | null)[] = []
    const charge1: (number | null)[] = []
    const charge2: (number | null)[] = []
    const discharge1: (number | null)[] = []
    const discharge2: (number | null)[] = []
    const level: (number | null)[] = []

    for (const p of points) {
        const ts = dayjs(p.timestamp || p.Timestamp)
        xData.push(ts.format('HH:mm:ss'))
        xTimestamps.push(ts.valueOf())
        voltage1.push(numOrNull(p.voltage1 ?? p.Voltage1))
        voltage2.push(numOrNull(p.voltage2 ?? p.Voltage2))
        charge1.push(numOrNull(p.chargeCurrent1 ?? p.ChargeCurrent1))
        charge2.push(numOrNull(p.chargeCurrent2 ?? p.ChargeCurrent2))
        discharge1.push(numOrNull(p.dischargeCurrent1 ?? p.DischargeCurrent1))
        discharge2.push(numOrNull(p.dischargeCurrent2 ?? p.DischargeCurrent2))
        level.push(numOrNull(p.level ?? p.Level))
    }

    return { xData, xTimestamps, voltage1, voltage2, charge1, charge2, discharge1, discharge2, level }
})

const hasChartData = computed(() => (seriesBundle.value.xTimestamps?.length || 0) > 0)

const singleChartData = computed<SeriesItem[]>(() => {
    const b = seriesBundle.value
    if (!b.xTimestamps.length) return []
    const base = { xData: b.xData, xTimestamps: b.xTimestamps }
    return [
        { key: 'voltage1', name: '電壓1', ...base, yData: b.voltage1, color: '#20A0FF' },
        { key: 'voltage2', name: '電壓2', ...base, yData: b.voltage2, color: '#7EC8FF' },
        { key: 'chargeCurrent1', name: '充電電流1', ...base, yData: b.charge1, color: '#FF9F40' },
        { key: 'chargeCurrent2', name: '充電電流2', ...base, yData: b.charge2, color: '#FFC07A' },
        { key: 'dischargeCurrent1', name: '放電電流1', ...base, yData: b.discharge1, color: '#FF6384' },
        { key: 'dischargeCurrent2', name: '放電電流2', ...base, yData: b.discharge2, color: '#FF9BB0' },
        { key: 'level', name: '電量%', ...base, yData: b.level, color: '#F5D76E', isLevel: true }
    ]
})

const multiPanels = computed(() => {
    const b = seriesBundle.value
    if (!b.xTimestamps.length) return []
    const base = { xData: b.xData, xTimestamps: b.xTimestamps }
    return [
        {
            key: 'level',
            title: '電量',
            yAxisName: '電量%',
            datas: [
                { key: 'level', name: '電量%', ...base, yData: b.level, color: '#F5D76E', isLevel: true }
            ]
        },
        {
            key: 'voltage',
            title: '電壓',
            yAxisName: '電壓',
            datas: [
                { key: 'voltage1', name: '電壓1', ...base, yData: b.voltage1, color: '#20A0FF' },
                { key: 'voltage2', name: '電壓2', ...base, yData: b.voltage2, color: '#7EC8FF' }
            ]
        },
        {
            key: 'charge',
            title: '充電電流',
            yAxisName: '充電電流',
            datas: [
                { key: 'chargeCurrent1', name: '充電電流1', ...base, yData: b.charge1, color: '#FF9F40' },
                { key: 'chargeCurrent2', name: '充電電流2', ...base, yData: b.charge2, color: '#FFC07A' }
            ]
        },
        {
            key: 'discharge',
            title: '放電電流',
            yAxisName: '放電電流',
            datas: [
                { key: 'dischargeCurrent1', name: '放電電流1', ...base, yData: b.discharge1, color: '#FF6384' },
                { key: 'dischargeCurrent2', name: '放電電流2', ...base, yData: b.discharge2, color: '#FF9BB0' }
            ]
        }
    ]
})

function applyPayload(data: any) {
    const root = data?.data && (data.data.agvList || data.data.AgvList || data.data.points)
        ? data.data
        : data

    const list = root?.agvList || root?.AgvList || []
    const nextAgv = root?.selectedAgv || root?.SelectedAgv || ''
    const nextDate = root?.date || root?.Date || selectedDate.value
    const summary = root?.statusSummary || root?.StatusSummary || {}

    agvList.value = Array.isArray(list) ? list.map((x: any) => String(x)).filter(Boolean) : []
    if (nextAgv) selectedAgv.value = nextAgv
    else if (!selectedAgv.value && agvList.value.length) {
        selectedAgv.value = pickDefaultAgv(agvList.value)
    }
    if (nextDate) selectedDate.value = nextDate

    realTimeData.updateRealTimeData('BatteryRecords', {
        agvList: agvList.value,
        selectedAgv: selectedAgv.value,
        date: selectedDate.value,
        points: root?.points || root?.Points || [],
        statusPeriods: root?.statusPeriods || root?.StatusPeriods || [],
        statusSummary: summary
    })
}

function pickDefaultAgv(list: string[]) {
    if (!list?.length) return ''
    const numberedOne = list.find(name => {
        const m = String(name).match(/(\d+)\s*$/)
        return m && Number(m[1]) === 1
    })
    return numberedOne || list[0]
}

function seedAgvListFromRealtime() {
    if (agvList.value.length) return
    const eqs = realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV || []
    const names = Array.from(new Set(
        eqs.map((e: any) => e.Name || e.name || e.AGV_Name).filter(Boolean).map(String)
    )).sort()
    if (names.length) {
        agvList.value = names
        if (!selectedAgv.value) selectedAgv.value = pickDefaultAgv(names)
    }
}

async function loadBySchema(resetDefault = false) {
    const schema = realTimeData.selectedAgvc
    if (!schema) return

    if (resetDefault) {
        selectedAgv.value = ''
        selectedDate.value = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
        agvList.value = []
    }

    seedAgvListFromRealtime()

    boundSchema.value = schema
    loading.value = true
    try {
        const res = await getBatteryRecords(
            schema,
            resetDefault ? '' : (selectedAgv.value || ''),
            selectedDate.value || ''
        )
        const data = res?.data !== undefined && !Array.isArray(res?.data) && typeof res.data === 'object'
            ? (res.data.agvList || res.data.points || res.data.AgvList ? res.data : res)
            : res
        if (data) applyPayload(data)
        if (!agvList.value.length) seedAgvListFromRealtime()
    } catch (e) {
        console.error('BatteryRecords API error:', e)
        seedAgvListFromRealtime()
        realTimeData.updateRealTimeData('BatteryRecords', {
            agvList: agvList.value,
            selectedAgv: selectedAgv.value,
            date: selectedDate.value,
            points: [],
            statusPeriods: [],
            statusSummary: {}
        })
    } finally {
        loading.value = false
    }
}

async function onAgvChange() {
    if (!selectedAgv.value) return
    await loadBySchema(false)
}

async function onFilterChange() {
    await loadBySchema(false)
}

function numOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

watch(
    () => realTimeData.selectedAgvc,
    async (schema, prev) => {
        if (!schema || schema === prev) return
        await loadBySchema(true)
    }
)

defineExpose({
    loadBySchema,
    fetchData: () => loadBySchema(false),
    reloadDefault: () => loadBySchema(true)
})
</script>

<style scoped lang="scss">
.battery-records {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    padding-top: 8px;
    overflow: hidden;
}

.card {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    h3 {
        margin: 0;
        padding: 12px 16px;
        background: #23272f;
        color: #fff;
        font-size: 1.1rem;
        border-bottom: 1px solid #333;
        flex-shrink: 0;
    }

    .flex-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        gap: 12px;
        flex-wrap: wrap;
        position: relative;
        z-index: 5;
    }

    .filters {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
    }

    .mode-group {
        margin-right: 4px;
    }

    .status-check {
        color: #ddd;
        margin-right: 4px;
    }

    .content {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    .chart-wrapper {
        padding: 10px;
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
}

.multi-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    width: 100%;
    height: 100%;
}

.multi-panel {
    min-height: 0;
    min-width: 0;
    background: #141414;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
}

.status-legend {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0 4px 8px;
    color: #ccc;
    font-size: 12px;
    flex-shrink: 0;

    .legend-title {
        color: #aaa;
        margin-right: 4px;
    }

    .legend-count {
        color: #aaa;
        font-size: 11px;
    }

    .legend-empty {
        color: #f0ad4e;
        font-size: 12px;
    }

    .legend-item {
        display: inline-flex;
        align-items: center;
        gap: 4px;

        .swatch {
            width: 18px;
            height: 12px;
            border-radius: 2px;
            display: inline-block;
            border: 2px solid;
            box-sizing: border-box;
        }
    }
}

.w-100 { width: 100%; }
.h-100 { height: 100%; }
</style>
