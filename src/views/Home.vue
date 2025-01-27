<template>
    <content-container>
        <div class="h-100">
            <el-row class="h-100">
                <el-col :lg="12" :gutter="10" class="h-100">
                    <div class="mock-content h-100 d-flex flex-column justify-content-between">
                        <e-chart :options="getChartOptions(n)" v-for="n in 3" :key="n" class="h-100">
                        </e-chart>
                    </div>
                </el-col>
                <el-col :lg="12" :gutter="10" class="h-100">
                    <div class="mock-content h-100 d-flex flex-column justify-content-between">
                        <e-chart v-for="n in 4" :key="n" :options="getChartOptions(n + 3)" class="h-100">
                        </e-chart>
                    </div>
                </el-col>
            </el-row>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import ContentContainer from '../components/ContentContainer.vue'
import EChart from '../components/BaseChart.vue'
import type { EChartsOption } from 'echarts'

const getChartOptions = (index: number): EChartsOption => {
    const options: Record<number, EChartsOption> = {
        1: {
            title: { text: 'Line Chart', textStyle: { color: '#fff' } },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: { type: 'value' },
            series: [{
                data: [150, 230, 224, 218, 135, 147, 260],
                type: 'line'
            }]
        },
        2: {
            title: { text: 'Bar Chart', textStyle: { color: '#fff' } },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                axisLabel: {
                    fontSize: 16
                }
            },
            yAxis: { type: 'value' },
            series: [{
                data: [120, 200, 150, 80, 70, 110, 130],
                type: 'bar'
            },
            {
                data: [120, 200, 150, 80, 70, 110, 130],
                type: 'line'
            }],
        },
        3: {
            title: { text: 'Pie Chart', textStyle: { color: '#fff' } },
            series: [{
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: 'A' },
                    { value: 735, name: 'B' },
                    { value: 580, name: 'C' },
                    { value: 484, name: 'D' }
                ]
            }]
        },
        4: {
            title: { text: 'Scatter Chart', textStyle: { color: '#fff' } },
            xAxis: { type: 'value' },
            yAxis: { type: 'value' },
            series: [{
                type: 'scatter',
                data: [[10, 8.04], [8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33]]
            }]
        },
        5: {
            title: { text: 'Radar Chart', textStyle: { color: '#fff' } },
            radar: {
                indicator: [
                    { name: 'Sales', max: 6500 },
                    { name: 'Admin', max: 16000 },
                    { name: 'Tech', max: 30000 },
                    { name: 'Support', max: 38000 },
                    { name: 'Dev', max: 52000 }
                ],
                axisName: {
                    color: 'white',
                    fontSize: 14
                }
            },
            series: [{
                type: 'radar',
                data: [{
                    value: [4200, 3000, 20000, 35000, 50000],
                    name: 'Budget'
                }]
            }]
        },
        6: {
            title: { text: 'Gauge Chart', textStyle: { color: '#fff' }, textAlign: 'center' },
            series: [{
                type: 'gauge',
                startAngle: 0,
                endAngle: 360,
                progress: {
                    show: true,
                    roundCap: true,
                    itemStyle: {
                        color: '#409EFF'
                    }
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}%',
                    offsetCenter: [0, '0%']
                },
                data: [{ value: 70 }],
                pointer: { show: false },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: [[1, '#333']],
                        width: 10
                    }
                },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false }
            }]
        },
        7: {
            title: { text: 'Stack Chart', textStyle: { color: '#fff' } },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Direct', 'Email', 'Union Ads', 'Video Ads'],
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Direct',
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [320, 332, 301, 334, 390, 330, 320]
                },
                {
                    name: 'Email',
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [120, 132, 101, 134, 90, 230, 210]
                },
                {
                    name: 'Union Ads',
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [220, 182, 191, 234, 290, 330, 310]
                },
                {
                    name: 'Video Ads',
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [150, 232, 201, 154, 190, 330, 410]
                }
            ]
        },
    }

    return {
        backgroundColor: 'transparent',
        textStyle: { color: '#fff' },
        ...options[index]
    }
}
</script>
<style scoped>
.mock-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>