<template>
    <div class="traffic-stats-dashboard">
        <div class="dashboard-grid">
            <div class="grid-item">
                <div class="card">
                    <h3>停等狀態統計</h3>
                    <div class="content">
                        <TagStopStatsMap
                            v-if="hasMap"
                            class="h-100 w-100"
                            mapId="map1" 
                            :map-model="realTimeData.AGVC_TrafficStats_mapModel" />
                        <div v-else class="map-empty">此場域無地圖資料</div>
                    </div>
                </div>
            </div>
            <div class="grid-item">
                <div class="card">
                    <h3>路線使用統計</h3>
                    <div class="content">
                        <PathUseStatsMap
                            v-if="hasMap"
                            class="h-100 w-100"
                            mapId="map2" 
                            :map-model="realTimeData.AGVC_TrafficStats_mapModel" />
                        <div v-else class="map-empty">此場域無地圖資料</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import PathUseStatsMap from '../maps/PathUseStatsMap.vue'
import TagStopStatsMap from '../maps/TagStopStatsMap.vue'
import { realTimeStore } from '@/stores/realTime'
import { computed } from 'vue'

const realTimeData = realTimeStore()
const hasMap = computed(() => {
    const m = realTimeData.AGVC_TrafficStats_mapModel
    return !!(m && (m.Map || m.Points))
})
</script>
<style scoped lang="scss">
.traffic-stats-dashboard {
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    display: flex;
    overflow: hidden;

    .dashboard-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(1, 1fr);
        gap: 0.5rem;

        .grid-item {
            @media (max-width: 768px) {
                height: 350px; // 手机视图下的固定高度
            }
        }
    }

    .map-empty {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 14px;
    }
}
</style>