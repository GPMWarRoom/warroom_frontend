<template>
    <BaseChart :options="options" :height="chartHeight" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseChart from '../../../common/charts/BaseChart.vue'
import { STATUS_COLORS, FALLBACK_COLORS } from '@/utils/eqStatusColors'

type StatusCount = { Status: string; Count: number }

const props = defineProps<{
    /** [設備名稱, 各狀態次數] */
    entries: [string, StatusCount[]][]
}>()

// 每台設備一列；設備多時圖表跟著變高，由外層捲動
const ROW_HEIGHT = 34
const chartHeight = computed(() => `${Math.max(240, props.entries.length * ROW_HEIGHT + 80)}px`)

// 淺色區塊（例如黃色的 Idle）用深色字，其餘用白字，確保百分比看得清楚
const labelColorFor = (hex: string) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex)
    if (!m) return '#fff'
    const [r, g, b] = [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16) / 255)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.6 ? '#1f2329' : '#fff'
}

const percentOf = (list: StatusCount[], status: string) => {
    const total = (list || []).reduce((sum, item) => sum + (item.Count || 0), 0)
    const hit = (list || []).find(item => item.Status === status)
    return total && hit ? Number(((hit.Count / total) * 100).toFixed(1)) : 0
}

// Y 軸為設備、X 軸為百分比，各狀態依比例堆疊成 100%
const options = computed(() => {
    const devices = props.entries.map(([name]) => name)
    const statuses: string[] = []
    props.entries.forEach(([, list]) => (list || []).forEach(item => {
        if (!statuses.includes(item.Status)) statuses.push(item.Status)
    }))

    let fallbackIndex = 0
    return {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            valueFormatter: (value: number) => `${value}%`
        },
        legend: { top: 0, data: statuses },
        grid: { left: 12, right: 36, top: 36, bottom: 12, containLabel: true },
        xAxis: {
            type: 'value',
            min: 0,
            max: 100,
            name: '%',
            axisLabel: { formatter: '{value}%' }
        },
        yAxis: {
            type: 'category',
            data: devices,
            inverse: true // 第一台設備在最上面
        },
        series: statuses.map(status => {
            const color = STATUS_COLORS[status] ?? FALLBACK_COLORS[fallbackIndex++ % FALLBACK_COLORS.length]
            return {
                name: status,
                type: 'bar',
                stack: 'percent',
                barMaxWidth: 22,
                emphasis: { focus: 'series' },
                itemStyle: { color },
                // 區段太窄時不顯示數字，避免擠在一起
                label: {
                    show: true,
                    color: labelColorFor(color),
                    fontSize: 11,
                    formatter: (params: { value: number }) => (params.value >= 8 ? `${params.value}%` : '')
                },
                data: props.entries.map(([, list]) => percentOf(list, status))
            }
        })
    }
})
</script>
