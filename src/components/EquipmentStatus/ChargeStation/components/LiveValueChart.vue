<template>
    <div class="live-value-chart">
        <div class="lv-header">
            <span class="lv-title">{{ title }}</span>
            <span class="lv-current" :class="{ warning: warning }">
                {{ currentText }}<small v-if="unit"> {{ unit }}</small>
            </span>
        </div>
        <div class="lv-body">
            <BaseChart :options="options" />
        </div>
    </div>
</template>

<script setup>
import BaseChart from '@/components/common/charts/BaseChart.vue'
import { reactive, computed, watch } from 'vue'
import { globalChartOptions } from '@/utils/globalChartOptions.js'

const props = defineProps({
    /** 指標名稱 */
    title: { type: String, default: '' },
    unit: { type: String, default: '' },
    color: { type: String, default: '#20A0FF' },
    /** [{ t: 毫秒時間戳, v: 數值|null }]，由父層持續累加 */
    samples: { type: Array, default: () => [] },
    /** X 軸顯示區間（毫秒），畫面固定寬度往左滑動 */
    windowMs: { type: Number, default: 60000 },
    decimals: { type: Number, default: 2 },
    warning: { type: Boolean, default: false }
})

const lastValue = computed(() => {
    const list = props.samples || []
    for (let i = list.length - 1; i >= 0; i--) {
        const v = list[i]?.v
        if (v !== null && v !== undefined && Number.isFinite(Number(v))) return Number(v)
    }
    return null
})

const currentText = computed(() =>
    lastValue.value === null ? '--' : lastValue.value.toFixed(props.decimals)
)

const options = reactive(new globalChartOptions())

/** 以資料最低值為底，不強制從 0，數值變化才看得出來 */
function yExtent(values) {
    const nums = values.filter(v => v !== null && v !== undefined && Number.isFinite(Number(v))).map(Number)
    if (!nums.length) return null
    let min = Math.min(...nums)
    let max = Math.max(...nums)
    if (min === max) {
        const pad = Math.max(Math.abs(min) * 0.05, 0.5)
        return { min: min - pad, max: max + pad }
    }
    const pad = (max - min) * 0.15
    return { min: min - pad, max: max + pad }
}

function pad2(n) {
    return String(n).padStart(2, '0')
}

watch(
    () => [props.samples, props.windowMs, props.color, props.title],
    () => {
        const list = props.samples || []
        const now = list.length ? list[list.length - 1].t : Date.now()
        const start = now - props.windowMs
        const visible = list.filter(s => s.t >= start)
        const extent = yExtent(visible.map(s => s.v))

        options.backgroundColor = 'transparent'
        options.title = { show: false }
        options.legend = { show: false }
        options.toolbox = { show: false }
        options.grid = { top: 8, left: 46, right: 10, bottom: 20, containLabel: false }
        options.tooltip = {
            trigger: 'axis',
            backgroundColor: 'rgba(50,50,50,0.92)',
            borderColor: '#333',
            textStyle: { color: '#fff', fontSize: 11 },
            formatter: (params) => {
                const p = Array.isArray(params) ? params[0] : params
                if (!p) return ''
                const d = new Date(p.value[0])
                const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
                const val = p.value[1] === null || p.value[1] === undefined
                    ? '--'
                    : Number(p.value[1]).toFixed(props.decimals)
                return `${time}<br/>${props.title}：${val}${props.unit ? ' ' + props.unit : ''}`
            }
        }
        options.xAxis = {
            type: 'time',
            min: start,
            max: now,
            axisLabel: {
                color: '#999',
                fontSize: 9,
                hideOverlap: true,
                formatter: (val) => {
                    const d = new Date(val)
                    return `${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
                }
            },
            axisLine: { lineStyle: { color: '#555' } },
            axisTick: { show: false },
            splitLine: { show: false }
        }
        options.yAxis = {
            type: 'value',
            scale: true,
            min: extent ? extent.min : undefined,
            max: extent ? extent.max : undefined,
            axisLabel: {
                color: '#999',
                fontSize: 9,
                width: 40,
                overflow: 'truncate',
                formatter: (val) => {
                    const n = Number(val)
                    if (!Number.isFinite(n)) return ''
                    const abs = Math.abs(n)
                    if (abs >= 100) return n.toFixed(0)
                    if (abs >= 10) return n.toFixed(1)
                    return n.toFixed(2)
                }
            },
            axisLine: { lineStyle: { color: '#555' } },
            splitLine: { lineStyle: { color: '#2a2a2a' } }
        }
        options.series = [{
            name: props.title,
            type: 'line',
            data: visible.map(s => [s.t, s.v]),
            showSymbol: false,
            smooth: false,
            connectNulls: false,
            lineStyle: { color: props.color, width: 2 },
            itemStyle: { color: props.color },
            areaStyle: { color: props.color, opacity: 0.14 }
        }]
    },
    { immediate: true, deep: true }
)
</script>

<style scoped lang="scss">
.live-value-chart {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: #141414;
    border: 1px solid #333;
    border-radius: 6px;
    overflow: hidden;
}

.lv-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px 2px;
    flex-shrink: 0;

    .lv-title {
        color: #bbb;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .lv-current {
        color: #fff;
        font-size: 16px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;

        small {
            font-size: 11px;
            font-weight: 400;
            color: #999;
        }

        &.warning {
            color: #ff4757;
        }
    }
}

.lv-body {
    flex: 1;
    min-height: 0;
    width: 100%;
}
</style>
