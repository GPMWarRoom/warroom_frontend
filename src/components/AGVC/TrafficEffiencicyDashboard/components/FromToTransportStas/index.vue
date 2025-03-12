<template>
    <div class="from-to-transport-stats h-100 d-flex flex-column">
        <FromToSelector />
        <div class="flex-fill d-flex flex-column justify-content-between">
            <h3>搬運結果</h3>
            <div class="h-100">
                <StackedBarChart
    :series="[
        { name: '系列1', data: [120, 132, 101] },
        { name: '系列2', data: [220, 182, 191] },
        { name: '系列3', data: [150, 232, 201] }
    ]"
    :categories="['1月', '2月', '3月']"
/>
            </div>
            <h3>執行時間</h3>
            <div class="h-100">
                <BarChart :data="[1,2,3,4,5,6,7,8,9,10]"/>
            </div>
            <h3>執行時間 Box Plot</h3>
            <div class="h-100">
                <BoxPlotChart
    :data="[[850, 900, 950, 1000, 1100], [750, 800, 850, 900, 1000]]"
    :categories="['A組', 'B組']"
/>
            </div>
        </div>
    </div>
</template>
<script setup>
import FromToSelector from './FromToSelector.vue'
import BarChart from '../../../../common/charts/BarChart.vue';
import StackedBarChart from '../../../../common/charts/StackedBarChart.vue';
import BoxPlotChart from '../../../../common/charts/BoxPlotChart.vue';
</script>
<style lang="scss" scoped>
.from-to-transport-stats {
    h3 {
        margin: 0;
        border-bottom:none;
        margin-block: 10px;
    }
}
</style>