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
  title: String,
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
  useGradient: {
    type: Boolean,
    default: true
  },
  colors: {
    type: Array,
    default: () => ['#79FF79', '#FF5151', '#ADADAD', '#FFB700', '#FF79FF']
  },
  datas: {
    type: Object,
    required: true
    /*
      格式範例：
      {
        xData: ['2025/04/22', '2025/04/23'],
        groups: ['機台A', '機台B'],
        stacks: ['取消', '失敗', '完成'],
        yDataList: [
          [ [1, 2], [3, 4], [5, 6] ], // 機台A 各 stack 各 xData 的數值
          [ [7, 8], [9, 10], [11, 12] ] // 機台B
        ]
      }
    */
  }
})

const options = reactive(new globalChartOptions())

watch(
  () => props.datas,
  (newDatas) => {
    const { xData, groups, stacks, yDataList } = newDatas || {}

    if (
      !Array.isArray(xData) ||
      !Array.isArray(groups) ||
      !Array.isArray(stacks) ||
      !Array.isArray(yDataList)
    ) return

    // 建立虛擬 x 軸：['2025/04/22-機台A', '2025/04/22-機台B', ...]
    const virtualXLabels = xData.flatMap(date => groups.map(g => `${date}`))
    options.xAxis.name = props.xAxisName
    options.xAxis.data = virtualXLabels
    options.yAxis.name = props.yAxisName
    options.title.text = props.title
    options.series = []
    options.tooltip = {
    trigger: 'axis',
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    textStyle: {
        color: '#fff'  // 文字白色
    },
    extraCssText: 'box-shadow: none; border: none;',
    axisPointer: { type: 'shadow' },
    formatter(params) {
        const index = params[0].dataIndex
        const hasOrigin = Array.isArray(props.datas.originalDataList)
        let result = `${params[0].axisValue}<br/>`

        params.forEach(p => {
            // groupIndex 依舊用 seriesIndex % groups.length
            const groupIndex = p.seriesIndex % props.datas.groups.length

            // stackIndex 是 Math.floor(seriesIndex / groups.length)
            const stackIndex = Math.floor(p.seriesIndex / props.datas.groups.length)

            const dateIndex = Math.floor(index / props.datas.groups.length)

            const percent = p.value

            let originalValue = null
            if (
                hasOrigin &&
                props.datas.originalDataList?.[groupIndex] &&
                props.datas.originalDataList[groupIndex]?.[stackIndex] &&
                props.datas.originalDataList[groupIndex][stackIndex]?.[dateIndex] != null
            ) {
                originalValue = props.datas.originalDataList[groupIndex][stackIndex][dateIndex]
            }

            if (hasOrigin && originalValue != null) {
                result += `${p.marker} ${p.seriesName}：${originalValue} (${percent}%)<br/>`
            } else {
                result += `${p.marker} ${p.seriesName}：${percent}<br/>`
            }
            })

            return result
        }
    }


    groups.forEach((group, groupIndex) => {
        stacks.forEach((stack, stackIndex) => {
            const seriesData = []

            xData.forEach((_, dateIndex) => {
                groups.forEach((g, gIdx) => {
                    if (gIdx === groupIndex) {
                    seriesData.push(yDataList[groupIndex][stackIndex][dateIndex])
                    } else {
                    seriesData.push(0) // 不屬於此 group 的位置補 0，避免堆疊錯位
                    }
                })
            })

            options.series.push({
                name: stack,
                type: 'bar',
                stack: `group-${groupIndex}`, // 同 group 用相同 stack key
                data: seriesData,
                itemStyle: {
                    color: props.colors[stackIndex % props.colors.length],
                    borderRadius: stackIndex === stacks.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0],
                    borderColor: '#fff',
                    borderWidth: 1
                },
                barGap: 0,
                barWidth: props.barWidth
            })
        })
    })

  },
  { immediate: true, deep: true }
)

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
