<template>
    <div class="card">
        <h3 class="flex-header">
            <div class="title-group">
                <span>過去資料</span>
                <el-tag size="small" type="info">當日使用次數：{{ usageCount }}</el-tag>
            </div>
            <div class="filters">
                <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    size="small"
                    placeholder="選擇日期"
                    value-format="YYYY-MM-DD"
                    style="width: 150px;"
                    :teleported="true"
                    :clearable="false"
                    @change="onDateChange"
                />
                <el-select
                    v-model="selectedSessionId"
                    size="small"
                    style="width: 210px;"
                    :teleported="true"
                    :placeholder="sessions.length ? '選擇充電時間' : '當日無充電紀錄'"
                    :loading="loading"
                    @change="onSessionChange"
                >
                    <el-option
                        v-for="s in sessions"
                        :key="s.id"
                        :label="s.label"
                        :value="s.id"
                    />
                </el-select>
                <el-button size="small" type="primary" :loading="loading" @click="reload(false)">查詢</el-button>
            </div>
        </h3>

        <div class="content chart-wrapper" v-loading="loading">
            <div v-if="hasPoints" class="multi-grid">
                <div v-for="panel in panels" :key="panel.key" class="multi-panel">
                    <BatteryLineChart
                        :datas="panel.datas"
                        :status-periods="[]"
                        :show-status-background="false"
                        :single-y-axis="true"
                        :compact="true"
                        :title="panel.title"
                        :yAxisName="panel.yAxisName"
                        class="w-100 h-100"
                    />
                </div>
            </div>
            <el-empty v-else :description="emptyText" class="w-100 h-100" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import BatteryLineChart from '@/components/common/charts/BatteryLineChart.vue'
import { realTimeStore } from '@/stores/realTime'
import { getChargeStationRecords } from '@/api/agvc'

const props = defineProps<{ stationName: string }>()

const realTimeData = realTimeStore()
const loading = ref(false)
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const selectedSessionId = ref<number | null>(null)

const payload = computed(() => realTimeData.ChargeStationRecords || {
    stationList: [],
    selectedStation: '',
    date: '',
    usageCount: 0,
    sessions: [],
    selectedSessionId: null,
    points: []
})

const sessions = computed<any[]>(() => payload.value.sessions || [])
const usageCount = computed<number>(() => payload.value.usageCount || 0)

const emptyText = computed(() => {
    if (!props.stationName) return '此場域無充電站'
    if (!sessions.value.length) return '當日查無充電紀錄'
    return '此充電區間無數值變化紀錄'
})

/** 9 個指標各自獨立一張圖，樣式沿用電池紀錄的多圖模式 */
const METRICS = [
    { key: 'voltageIn', title: '輸入電壓 Vin', yAxisName: '電壓', color: '#20A0FF' },
    { key: 'voltageOut', title: '輸出電壓 Vout', yAxisName: '電壓', color: '#7EC8FF' },
    { key: 'current', title: '輸出電流 Iout', yAxisName: '電流', color: '#FF9F40' },
    { key: 'cc', title: '定電流設定／讀值 CC', yAxisName: '電流', color: '#FFC07A' },
    { key: 'cv', title: '定電壓設定／讀值 CV', yAxisName: '電壓', color: '#5AD8A6' },
    { key: 'fv', title: '浮充設定／讀值 FV', yAxisName: '電壓', color: '#9EE7C8' },
    { key: 'tc', title: '溫度補償相關讀值 TC', yAxisName: '讀值', color: '#F5D76E' },
    { key: 'chargerTemperature', title: '充電器溫度', yAxisName: '溫度', color: '#FF6384' },
    { key: 'stationTemperature', title: '站體溫度', yAxisName: '溫度', color: '#FF9BB0' }
]

const seriesBundle = computed(() => {
    const points = payload.value.points || []
    const xData: string[] = []
    const xTimestamps: number[] = []
    const values: Record<string, (number | null)[]> = {}
    METRICS.forEach(m => { values[m.key] = [] })

    for (const p of points) {
        const ts = dayjs(p.timestamp || p.Timestamp)
        xData.push(ts.format('HH:mm:ss'))
        xTimestamps.push(ts.valueOf())
        for (const m of METRICS) {
            const raw = p[m.key] ?? p[m.key.charAt(0).toUpperCase() + m.key.slice(1)]
            values[m.key].push(numOrNull(raw))
        }
    }
    return { xData, xTimestamps, values }
})

function hasSeriesValues(yData: (number | null)[] | undefined): boolean {
    return (yData || []).some(v => v !== null && v !== undefined && Number.isFinite(Number(v)))
}

const panels = computed(() => {
    const b = seriesBundle.value
    if (!b.xTimestamps.length) return []
    const base = { xData: b.xData, xTimestamps: b.xTimestamps }
    return METRICS.map(m => ({
        key: m.key,
        title: m.title,
        yAxisName: m.yAxisName,
        datas: [{ key: m.key, name: m.title, ...base, yData: b.values[m.key], color: m.color }]
            .filter(s => hasSeriesValues(s.yData))
    })).filter(panel => panel.datas.length > 0)
})

const hasPoints = computed(() => panels.value.length > 0)

function numOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

function applyPayload(root: any) {
    if (!root) return
    const nextSessions = root.sessions || root.Sessions || []
    const nextSessionId = root.selectedSessionId ?? root.SelectedSessionId ?? null
    const nextDate = root.date || root.Date || selectedDate.value

    selectedDate.value = nextDate
    selectedSessionId.value = nextSessionId

    realTimeData.updateRealTimeData('ChargeStationRecords', {
        stationList: root.stationList || root.StationList || [],
        selectedStation: root.selectedStation || root.SelectedStation || '',
        date: nextDate,
        usageCount: root.usageCount ?? root.UsageCount ?? nextSessions.length,
        sessions: nextSessions,
        selectedSessionId: nextSessionId,
        points: root.points || root.Points || []
    })
}

function clearPayload() {
    selectedSessionId.value = null
    realTimeData.updateRealTimeData('ChargeStationRecords', {
        stationList: [],
        selectedStation: props.stationName || '',
        date: selectedDate.value,
        usageCount: 0,
        sessions: [],
        selectedSessionId: null,
        points: []
    })
}

/**
 * @param keepSession true 時沿用目前選到的充電區間，false 代表重新挑當日第一筆
 */
async function reload(keepSession = false) {
    const schema = realTimeData.selectedAgvc
    if (!schema) return

    loading.value = true
    try {
        const res = await getChargeStationRecords(
            schema,
            props.stationName || '',
            selectedDate.value || '',
            keepSession ? selectedSessionId.value : null
        )
        const root = res && (res.sessions || res.stationList || res.points) ? res : (res?.data || res)
        applyPayload(root)
    } catch (e) {
        console.error('ChargeStationRecords API error:', e)
        clearPayload()
    } finally {
        loading.value = false
    }
}

async function onDateChange() {
    await reload(false)
}

async function onSessionChange() {
    await reload(true)
}

onMounted(async () => {
    await reload(false)
})

// 切換充電站或場域時重新查詢當日紀錄
watch(() => props.stationName, async (name, prev) => {
    if (!name || name === prev) return
    await reload(false)
})

watch(() => realTimeData.selectedAgvc, async (schema, prev) => {
    if (!schema || schema === prev) return
    selectedDate.value = dayjs().format('YYYY-MM-DD')
    await reload(false)
})

defineExpose({
    reload,
    reloadDefault: async () => {
        selectedDate.value = dayjs().format('YYYY-MM-DD')
        await reload(false)
    }
})
</script>

<style scoped lang="scss">
.card {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    h3 {
        margin: 0;
        padding: 8px 16px;
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
        gap: 12px;
        flex-wrap: wrap;
        position: relative;
        z-index: 5;
    }

    .title-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .filters {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
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
        box-sizing: border-box;
        overflow-y: auto;
    }
}

.multi-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(200px, 1fr);
    gap: 8px;
    width: 100%;
    height: 100%;
    align-items: stretch;
    justify-items: stretch;
}

.multi-panel {
    min-height: 0;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #141414;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;

    > :deep(*) {
        flex: 1;
        min-height: 0;
        width: 100%;
        height: 100%;
    }
}

.w-100 { width: 100%; }
.h-100 { height: 100%; }

@media (max-width: 1200px) {
    .multi-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
