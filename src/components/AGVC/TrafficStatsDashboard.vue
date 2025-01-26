<template>
    <div class="traffic-stats-dashboard">
        <el-row class="h-50">
            <el-col class="h-100" :lg="12">
                <h1>交管狀態1</h1>
                <PathUseStatsMap mapId="map1" />
            </el-col>
            <el-col class="bg-danger h-100" :lg="12">
                <h1>交管狀態2</h1>
                <PathUseStatsMap mapId="map2" />
            </el-col>
             <el-col class="bg-warning h-100" :lg="12">
                <h1>交管狀態3</h1>
            </el-col>
            <el-col class="bg-danger h-100" :lg="12">
                <h1>交管狀態4</h1>
            </el-col>
        </el-row>
       
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PathUseStatsMap from './maps/PathUseStatsMap.vue'

onMounted(() => {
})

</script>

<style scoped lang="scss">
.traffic-stats-dashboard {
    height: 100%;
    width: 100%;
    background-color: #333;
    .map-container {
        height: 100%;
        width: 100%;
    }
}
</style>