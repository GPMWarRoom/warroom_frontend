<template>
    <BaseChart
        ref="chartRef"
        v-show="options.series.length > 0"
        :options="options"
    />
</template>
  
<script setup>
import { reactive, watch } from 'vue'
import BaseChart from './BaseChart.vue'
import { globalChartOptions } from '../../../utils/globalChartOptions.js'

const props = defineProps({
    title: {
        type: String,
    },
    datas: {
        type: Object,
        required: true // datas: { name: ['取消', '失敗', '完成'], xData: ['2025/04/22'], yDataList: [[41], [7], [9]] }
    },
    xAxisName: {
        type: String,
        default: '時間'
    },
    yAxisName: {
        type: String,
        default: '件數'
    },
    barWidth: {
        type: Number,
        default: 15
    },
    colors: {
        type: Array,
        default: () => ['#ADADAD', '#FF5151', '#79FF79' ]
    },
    useGradient: {
        type: Boolean,
        default: true
    }
})

// reactive options
const options = reactive(new globalChartOptions())

// props.datas 變動時更新圖表
watch(
() => props.datas,
(newDatas) => {
    const { name, xData, yDataList } = newDatas || {}
    
    if (
        Array.isArray(name) &&
        Array.isArray(xData) &&
        Array.isArray(yDataList) &&
        name.length === yDataList.length
    ){
        // 檢查每組 y 資料是否長度一致
        const mismatch = yDataList.some(arr => arr.length !== xData.length)
        if (mismatch) {
            console.warn('⚠️ 每組 yData 長度必須等於 xData 長度')
            return
        }
    
        options.title.text = props.title
        options.xAxis.name = props.xAxisName
        options.xAxis.type = 'category'
        options.xAxis.data = xData
        options.yAxis.name = props.yAxisName

        options.series = name.map((label, index) => ({
            name: label,
            type: 'bar',
            stack: 'total',
            data: yDataList[index],
            barWidth: props.barWidth,
            itemStyle: {
            color: props.useGradient
                ? {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                    { offset: 1, color: props.colors[index] },
                    { offset: 0, color: lightenColor(props.colors[index], 30) }
                    ]
                }
                : props.colors[index],
            borderRadius: index === name.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0],
            borderColor: '#fff',
            borderWidth: 1
            }
        }))
    }
},
{ immediate: true, deep: true }
)

// 調亮顏色的輔助函數
function lightenColor(color, percent) {
const num = parseInt(color.replace('#', ''), 16)
const amt = Math.round(2.55 * percent)
const R = (num >> 16) + amt
const G = (num >> 8 & 0x00FF) + amt
const B = (num & 0x0000FF) + amt
return (
    '#' +
    (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
    .toString(16)
    .slice(1)
)
}
</script>

<style scoped lang="scss"></style>
  