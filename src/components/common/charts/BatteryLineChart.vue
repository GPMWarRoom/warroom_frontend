<template>
    <BaseChart
        v-if="options.series.length > 0"
        :options="options"
    />
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { reactive, watch } from 'vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'
import { AGV_STATUS_COLORS, AGV_STATUS_BG, AGV_STATUS_BY_CODE } from '../../../utils/agvStatusColors.js'

const STATUS_BY_CODE = AGV_STATUS_BY_CODE

const STATUS_META = {
    initializing: { label: 'initializing', bg: AGV_STATUS_BG.initializing, solid: AGV_STATUS_COLORS.initializing },
    idle: { label: 'idle', bg: AGV_STATUS_BG.idle, solid: AGV_STATUS_COLORS.idle },
    run: { label: 'run', bg: AGV_STATUS_BG.run, solid: AGV_STATUS_COLORS.run },
    down: { label: 'down', bg: AGV_STATUS_BG.down, solid: AGV_STATUS_COLORS.down },
    charging: { label: 'charging', bg: AGV_STATUS_BG.charging, solid: AGV_STATUS_COLORS.charging },
    unknown: { label: 'unknown', bg: AGV_STATUS_BG.unknown, solid: AGV_STATUS_COLORS.unknown }
}

function resolveStatusKey(period) {
    // 優先用數字 status（0/1/2/3），避免字串對應錯誤造成整段同色
    const raw = period.status ?? period.Status ?? period.Main_Status ?? period.MainStatus
    if (raw !== undefined && raw !== null && raw !== '') {
        const n = Number(raw)
        if (Number.isFinite(n) && STATUS_BY_CODE[n] !== undefined) {
            return STATUS_BY_CODE[n]
        }
    }
    const text = String(period.statusText || period.StatusText || '').trim().toLowerCase()
    if (STATUS_META[text]) return text
    if (['idle', 'standby', 'wait', 'ready', 'idling', 'stop'].some(k => text.includes(k))) return 'idle'
    if (['run', 'execut', 'move', 'auto', 'working', 'busy'].some(k => text.includes(k))) return 'run'
    if (['down', 'alarm', 'error', 'fault', 'warn'].some(k => text.includes(k))) return 'down'
    if (['charg', 'battery'].some(k => text.includes(k))) return 'charging'
    if (['init'].some(k => text.includes(k))) return 'initializing'
    return 'unknown'
}

function toMs(value) {
    if (value == null) return NaN
    if (typeof value === 'number') return value
    const ms = new Date(value).getTime()
    return ms
}

function buildMarkArea(statusPeriods) {
    if (!statusPeriods?.length) return undefined

    const areas = []
    for (const period of statusPeriods) {
        const startMs = toMs(period.startTime || period.StartTime)
        const endMs = toMs(period.endTime || period.EndTime)
        if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) continue

        const statusKey = resolveStatusKey(period)
        const meta = STATUS_META[statusKey] || STATUS_META.unknown
        areas.push([
            {
                name: meta.label,
                xAxis: startMs,
                itemStyle: {
                    color: meta.bg,
                    borderColor: meta.solid,
                    borderWidth: 1,
                    borderType: 'solid'
                }
            },
            { xAxis: endMs }
        ])
    }

    return areas.length
        ? { silent: true, data: areas, label: { show: false }, z: 0 }
        : undefined
}

const props = defineProps({
    datas: {
        type: Array,
        default: () => []
    },
    statusPeriods: {
        type: Array,
        default: () => []
    },
    xAxisName: {
        type: String,
        default: '時間'
    },
    yAxisName: {
        type: String,
        default: '數值'
    },
    levelAxisName: {
        type: String,
        default: '電量%'
    },
    title: {
        type: String,
        default: ''
    }
})

const options = reactive(new globalChartOptions())

watch(
    () => [props.datas, props.statusPeriods],
    () => {
        const seriesList = props.datas || []
        if (!seriesList.length || !seriesList[0]?.yData?.length) {
            options.series = []
            return
        }

        const xTimestamps = seriesList[0].xTimestamps || []
        options.title.text = props.title
        options.backgroundColor = '#141414'
        options.grid = {
            top: '18%',
            left: '3%',
            right: '5%',
            bottom: '12%',
            containLabel: true
        }
        options.dataZoom = [
            { type: 'inside', xAxisIndex: [0], start: 0, end: 100 },
            {
                type: 'slider',
                xAxisIndex: [0],
                start: 0,
                end: 100,
                height: 18,
                bottom: 8,
                borderColor: '#444',
                textStyle: { color: '#ccc' }
            }
        ]
        options.tooltip = {
            trigger: 'axis',
            backgroundColor: 'rgba(50,50,50,0.92)',
            borderColor: '#333',
            textStyle: { color: '#fff' }
        }
        options.xAxis = {
            type: 'time',
            name: props.xAxisName,
            axisLabel: {
                color: '#fff',
                fontSize: 10,
                formatter: (val) => {
                    const d = new Date(val)
                    const hh = String(d.getHours()).padStart(2, '0')
                    const mm = String(d.getMinutes()).padStart(2, '0')
                    const ss = String(d.getSeconds()).padStart(2, '0')
                    return `${hh}:${mm}:${ss}`
                }
            },
            axisLine: { lineStyle: { color: '#666' } }
        }
        options.yAxis = [
            {
                type: 'value',
                name: props.yAxisName,
                axisLabel: { color: '#fff', fontSize: 11 },
                axisLine: { lineStyle: { color: '#666' } },
                splitLine: { lineStyle: { color: '#333' } },
                nameTextStyle: { color: '#ccc' }
            },
            {
                type: 'value',
                name: props.levelAxisName,
                min: 0,
                max: 100,
                axisLabel: { color: '#F5D76E', fontSize: 11, formatter: '{value}%' },
                axisLine: { lineStyle: { color: '#F5D76E' } },
                splitLine: { show: false },
                nameTextStyle: { color: '#F5D76E' }
            }
        ]

        const markArea = buildMarkArea(props.statusPeriods)

        // 獨立一條透明 series 專門畫狀態背景，避免跟數據線搶層級 / 顏色誤解
        const statusBgSeries = markArea
            ? [{
                name: '_statusBg',
                type: 'line',
                data: [],
                silent: true,
                showSymbol: false,
                lineStyle: { opacity: 0, width: 0 },
                itemStyle: { opacity: 0 },
                markArea,
                z: 1,
                tooltip: { show: false },
                legendHoverLink: false
            }]
            : []

        options.series = [
            ...statusBgSeries,
            ...seriesList.map((item) => {
                const isLevel = item.isLevel === true
                const color = item.color || '#20A0FF'
                const data = (item.yData || []).map((v, i) => [xTimestamps[i], v])
                return {
                    name: item.name,
                    type: 'line',
                    yAxisIndex: isLevel ? 1 : 0,
                    data,
                    showSymbol: false,
                    smooth: false,
                    sampling: 'lttb',
                    large: true,
                    lineStyle: {
                        color,
                        width: isLevel ? 4 : 1.5
                    },
                    itemStyle: { color },
                    z: isLevel ? 10 : 5
                }
            })
        ]

        options.legend = {
            show: true,
            top: 8,
            textStyle: { color: '#fff', fontSize: 11 },
            data: seriesList.map(s => s.name)
        }
    },
    { immediate: true, deep: true }
)
</script>

<style scoped lang="scss"></style>
