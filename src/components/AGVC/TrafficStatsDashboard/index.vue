<template>
    <div class="traffic-stats-dashboard">
        <div class="dashboard-grid">
            <div class="grid-item">
                <div class="card">
                    <h3>停等狀態統計</h3>
                    <div class="content">
                        <TagStopStatsMap class="h-100 w-100" v-if="showMap"
                            mapId="map1" 
                            :map-model="realTimeData.AGVC_TrafficStats_mapModel"
                            :key="mapModelKey" />
                    </div>
                </div>
            </div>
            <div class="grid-item">
                <div class="card">
                    <h3>路線使用統計</h3>
                    <div class="content">
                        <PathUseStatsMap class="h-100 w-100" v-if="showMap"
                            mapId="map2" 
                            :map-model="realTimeData.AGVC_TrafficStats_mapModel"
                            :key="mapModelKey" />
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
import { ref, watch } from 'vue'

const realTimeData = realTimeStore()
const mapModelKey = ref(Date.now())

const showMap = ref(false)
watch(
  () => realTimeData.AGVC_TrafficStats_mapModel,
  (val) => {
    if (val && val.Map) {
      showMap.value = false
      setTimeout(() => { showMap.value = true }, 0)
    }
  },
  { deep: true }
)

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
}
</style>