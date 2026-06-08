<template>
    <BaseChart
        ref="chartRef"
        :options="options"
    />
</template>

<script setup>
import { reactive, watch } from 'vue'
import BaseChart from './BaseChart.vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'
import * as echarts from 'echarts'
import 'echarts/lib/chart/boxplot'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'

const props = defineProps({
    title: {
        type: String,
        default: ''
    },
    datas: {
        type: Object,
        required: true, // { name: '資料名稱', xData: ['2025/04/22'], yDataList: [[min, Q1, Q2, Q3, max], ...] }
    },
    xAxisName: {
        type: String,
        default: '類別',
    },
    yAxisName: {
        type: String,
        default: '數值',
    },
    boxColor: {
        type: String,
        default: '#20A0FF',
    },
    useGradient: {
        type: Boolean,
        default: true,
    },
    startColor: {
        type: String,
        default: '#83bff6',
    },
    endColor: {
        type: String,
        default: '#188df0',
    }
})

const options = reactive(new globalChartOptions())

watch(
  () => props.datas,
  (newDatas) => {
    const { name, xData, yDataList } = newDatas || {}
    // 防錯檢查：確保 xData 和 yDataList 是有效的，並且長度一致
    if (
        typeof name === 'string' &&
        Array.isArray(xData) &&
        Array.isArray(yDataList) &&
        yDataList.length === xData.length &&
        yDataList.length > 0 &&
        yDataList.every(item => Array.isArray(item) && item.length === 5)
    ) {
    // 轉置 yDataList: [[min, Q1, Q2, Q3, max], ...] => 5 組陣列
    const transformedYDataList = yDataList[0].map((_, index) => {
        return yDataList.map(row => row[index])
    })

    const boxData = yDataList.map(row => ({
        value: row
    }))

    options.title.text = props.title || name
    options.xAxis.data = xData
    
    // 強制顯示所有 X 軸標籤 (避免 ECharts 自動隱藏)
    if (!options.xAxis.axisLabel) {
        options.xAxis.axisLabel = {}
    }
    options.xAxis.axisLabel.interval = 0
    if (xData.length > 5) {
        options.xAxis.axisLabel.rotate = 0
    } else {
        options.xAxis.axisLabel.rotate = 0
    }

    options.series = [
        {
        name,
        type: 'boxplot',
        data: boxData,
        itemStyle: {
            color: props.useGradient
            ? {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                    { offset: 1, color: props.startColor },
                    { offset: 0, color: props.endColor }
                ]
                }
            : props.boxColor,
            borderColor: '#fff',
            borderWidth: 1
        },
        tooltip: {
            formatter: function (param) {
            const [min, Q1, Q2, Q3, max] = param.data.value
            return [
                `${param.name}:`,
                `最大值: ${max}`,
                `上四分位數: ${Q3}`,
                `中位數: ${Q2}`,
                `下四分位數: ${Q1}`,
                `最小值: ${min}`
            ].join('<br/>')
            }
        }
        }
    ]
    } else {
        options.series = []
    }
    },
    { immediate: true, deep: true }
)
</script>

<style scoped lang="scss"></style>
