<template>
    <BaseChart
        v-if="options.series.length > 0"
        :options="options"
        @chartReady="onChartReady"
    />
</template>

<script setup>
import BaseChart from './BaseChart.vue'
import { reactive, ref, watch, onBeforeUnmount } from 'vue'
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
    return new Date(value).getTime()
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
    showStatusBackground: {
        type: Boolean,
        default: true
    },
    /** 單 Y 軸模式（多圖拆分用）；false 時電量走右軸 */
    singleYAxis: {
        type: Boolean,
        default: false
    },
    compact: {
        type: Boolean,
        default: false
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
/** 記住圖例勾選，避免 notMerge 重繪後全部又亮回來；並保證至少一條 */
const legendSelected = ref({})
let chartInst = null

function seriesNames(list) {
    return (list || []).map(s => s.name).filter(Boolean)
}

function ensureAtLeastOneSelected(names, selected) {
    const next = { ...selected }
    names.forEach((n) => {
        if (next[n] === undefined) next[n] = true
    })
    if (names.length && !names.some(n => next[n] !== false)) {
        next[names[0]] = true
    }
    return next
}

function onChartReady(chart) {
    chartInst = chart
    chart.off('legendselectchanged')
    chart.on('legendselectchanged', (params) => {
        const names = seriesNames(props.datas)
        if (!names.length) return

        const selected = { ...(params.selected || {}) }
        const visible = names.filter(n => selected[n] !== false)
        // 不允許關掉最後一條：若全關則把剛點的那條（或第一條）強制選回
        if (visible.length === 0) {
            const restore = names.includes(params.name) ? params.name : names[0]
            selected[restore] = true
            chart.dispatchAction({ type: 'legendSelect', name: restore })
        }
        legendSelected.value = Object.fromEntries(names.map(n => [n, selected[n] !== false]))
    })
}

onBeforeUnmount(() => {
    if (chartInst) {
        chartInst.off('legendselectchanged')
        chartInst = null
    }
})

// 換指標組合時重設圖例（例如單圖↔多圖、或系列名稱變更）
watch(
    () => seriesNames(props.datas).join('|'),
    () => {
        legendSelected.value = {}
    }
)

watch(
    () => [props.datas, props.statusPeriods, props.showStatusBackground, props.singleYAxis, props.compact, props.title, props.yAxisName],
    () => {
        const seriesList = props.datas || []
        if (!seriesList.length || !seriesList[0]?.yData?.length) {
            options.series = []
            return
        }

        const xTimestamps = seriesList[0].xTimestamps || []
        const onlyLevel = seriesList.every(s => s.isLevel)
        const noLevel = seriesList.every(s => !s.isLevel)
        const useSingle = props.singleYAxis || onlyLevel || noLevel

        options.title = {
            text: props.title,
            left: 8,
            top: 4,
            textStyle: { color: '#fff', fontSize: props.compact ? 12 : 13 }
        }
        options.backgroundColor = '#141414'
        options.grid = {
            top: props.compact ? (props.title ? '22%' : '14%') : '18%',
            left: '3%',
            right: useSingle ? '4%' : '5%',
            bottom: props.compact ? '8%' : '12%',
            containLabel: true
        }
        options.dataZoom = props.compact
            ? [{ type: 'inside', xAxisIndex: [0], start: 0, end: 100 }]
            : [
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
            name: props.compact ? '' : props.xAxisName,
            axisLabel: {
                color: '#fff',
                fontSize: props.compact ? 9 : 10,
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

        if (useSingle) {
            const isLevelAxis = onlyLevel
            options.yAxis = [{
                type: 'value',
                name: props.yAxisName,
                min: isLevelAxis ? 0 : undefined,
                max: isLevelAxis ? 100 : undefined,
                axisLabel: {
                    color: isLevelAxis ? '#F5D76E' : '#fff',
                    fontSize: 11,
                    formatter: isLevelAxis ? '{value}%' : undefined
                },
                axisLine: { lineStyle: { color: isLevelAxis ? '#F5D76E' : '#666' } },
                splitLine: { lineStyle: { color: '#333' } },
                nameTextStyle: { color: isLevelAxis ? '#F5D76E' : '#ccc' }
            }]
        } else {
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
        }

        const markArea = props.showStatusBackground
            ? buildMarkArea(props.statusPeriods)
            : undefined

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
                    yAxisIndex: (!useSingle && isLevel) ? 1 : 0,
                    data,
                    showSymbol: false,
                    smooth: false,
                    sampling: 'lttb',
                    // large 模式在 legend 隱藏時容易殘留線條，故不啟用
                    lineStyle: {
                        color,
                        width: isLevel ? 3 : 1.5
                    },
                    itemStyle: { color },
                    z: isLevel ? 10 : 5
                }
            })
        ]

        const names = seriesNames(seriesList)
        const selected = ensureAtLeastOneSelected(
            names,
            Object.fromEntries(names.map(n => [
                n,
                legendSelected.value[n] === undefined ? true : legendSelected.value[n]
            ]))
        )
        legendSelected.value = selected

        options.legend = {
            show: true,
            top: props.compact ? 22 : 8,
            right: 8,
            selectedMode: true,
            selected,
            textStyle: { color: '#fff', fontSize: props.compact ? 10 : 11 },
            data: names
        }
    },
    { immediate: true, deep: true }
)
</script>

<style scoped lang="scss"></style>
