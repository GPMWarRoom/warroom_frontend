<template>
    <div class="charge-station">
        <div class="page-bar">
            <div class="bar-group">
                <span class="bar-label">檢視</span>
                <el-select v-model="viewMode" size="small" style="width: 140px;" :teleported="true">
                    <el-option label="即時狀態" value="realtime" />
                    <el-option label="過去資料" value="history" />
                </el-select>
            </div>
            <div class="bar-group">
                <span class="bar-label">充電站</span>
                <el-select
                    v-model="selectedStation"
                    size="small"
                    style="width: 200px;"
                    filterable
                    :teleported="true"
                    :placeholder="stationList.length ? '選擇充電站' : '此場域無充電站'"
                >
                    <el-option v-for="name in stationList" :key="name" :label="name" :value="name" />
                </el-select>
                <el-tag v-if="currentStation" size="small" type="info" class="tag-chip">
                    Tag：{{ currentStation.Tag ?? '-' }}
                </el-tag>
            </div>
        </div>

        <RealTimeStatus
            v-if="viewMode === 'realtime'"
            class="section"
            :station="currentStation"
            :samples="samples"
        />
        <ChargeStationRecords
            v-else
            class="section"
            ref="recordsRef"
            :station-name="selectedStation"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import RealTimeStatus from './components/RealTimeStatus.vue'
import ChargeStationRecords from './components/ChargeStationRecords.vue'
import { realTimeStore } from '@/stores/realTime'

/** 取樣節流（對齊後端 500ms 輪詢）與保留時間（對應最長的顯示區間 10 分鐘） */
const SAMPLE_INTERVAL_MS = 500
const SAMPLE_RETENTION_MS = 10 * 60 * 1000
const SAMPLE_MAX_COUNT = 2000
const METRIC_KEYS = [
    'voltageIn', 'voltageOut', 'current', 'cc', 'cv', 'fv',
    'tc', 'chargerTemperature', 'stationTemperature'
] as const
/** 前端欄位 → 推播回來的 PascalCase 欄位 */
const METRIC_SOURCE: Record<string, string> = {
    voltageIn: 'VoltageIn',
    voltageOut: 'VoltageOut',
    current: 'Current',
    cc: 'CC',
    cv: 'CV',
    fv: 'FV',
    tc: 'TC',
    chargerTemperature: 'ChargerTemperature',
    stationTemperature: 'StationTemperature'
}

const realTimeData = realTimeStore()
const recordsRef = ref()
const viewMode = ref<'realtime' | 'history'>('realtime')
const selectedStation = ref('')
const samples = ref<any[]>([])
let lastSampleAt = 0

/** 由 SignalR 推播而來的即時狀態，順序即資料庫回傳順序 */
const stations = computed<any[]>(() => realTimeData.AGVC_RealTimeDashboard_EQStatus_ChargeStation || [])

const stationList = computed<string[]>(() =>
    stations.value.map((s: any) => s?.Name).filter(Boolean).map((n: any) => String(n))
)

const currentStation = computed(() => {
    if (!selectedStation.value) return null
    return stations.value.find((s: any) => String(s?.Name) === String(selectedStation.value)) || null
})

function numOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

function resetSamples() {
    samples.value = []
    lastSampleAt = 0
}

// 預設選資料庫第一筆；推播更新後若目前選的站點消失也自動回到第一筆
watch(stationList, (names) => {
    if (!names.length) {
        selectedStation.value = ''
        return
    }
    if (!selectedStation.value || !names.includes(selectedStation.value)) {
        selectedStation.value = names[0] || ''
    }
}, { immediate: true })

// 換站點或換場域時清空曲線，避免不同站的數值接在一起
watch(selectedStation, () => resetSamples())
watch(() => realTimeData.selectedAgvc, () => resetSamples())

// 每次推播就取一筆樣本，形成「工作管理員」式的即時曲線
watch(currentStation, (station) => {
    if (!station) return
    const now = Date.now()
    if (now - lastSampleAt < SAMPLE_INTERVAL_MS) return
    lastSampleAt = now

    const sample: any = { t: now }
    for (const key of METRIC_KEYS) {
        sample[key] = numOrNull(station[METRIC_SOURCE[key]])
    }

    const next = [...samples.value, sample].filter(s => now - s.t <= SAMPLE_RETENTION_MS)
    samples.value = next.length > SAMPLE_MAX_COUNT ? next.slice(next.length - SAMPLE_MAX_COUNT) : next
}, { immediate: true })

async function loadHistory(resetDefault = false) {
    if (viewMode.value !== 'history') return
    await nextTick()
    if (resetDefault && recordsRef.value?.reloadDefault) {
        await recordsRef.value.reloadDefault()
    } else if (recordsRef.value?.reload) {
        await recordsRef.value.reload(!resetDefault)
    }
}

defineExpose({
    loadHistory,
    reloadDefault: () => loadHistory(true)
})
</script>

<style scoped lang="scss">
.charge-station {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
}

.page-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    flex-shrink: 0;
    padding: 8px 16px;
    background: #23272f;
    border: 1px solid #333;
    border-radius: 8px;
    position: relative;
    z-index: 6;
}

.bar-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.bar-label {
    color: #aaa;
    font-size: 12px;
}

.tag-chip {
    font-weight: bold;
}

.section {
    flex: 1;
    min-height: 0;
}
</style>
