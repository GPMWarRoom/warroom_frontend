<template>
    <div class="agv-utilization">
        <StackedBarChart v-if="selectedUtilizationType === 'status'" :series="[]" />
        <LineChart v-if="selectedUtilizationType === 'odometer'" :datas="datas" />
    </div>
</template>
<script setup>
import { ref } from 'vue';
import StackedBarChart from '../../../common/charts/StackedBarChart.vue';
import LineChart from '../../../common/charts/LineChart.vue';

const props = defineProps({
    datas: {
        type: Array,
        required: true
    },
    selectedUtilizationType: {
        type: String,
        required: true
    }
})

</script>
<style lang="scss" scoped>
.agv-utilization {
    width: 100%;
    height: 100%;
}
</style>