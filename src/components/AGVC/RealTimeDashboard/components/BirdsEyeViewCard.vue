<template>
    <div class="traffic-stats-dashboard">
        <div class="dashboard-grid">
            <div class="grid-item">
                <div class="card">
                    <h3>Bird's Eye View</h3>
                    <BirdViewMap class="h-100 w-100" v-if="showMap"
                        mapId="map3" 
                        :map-model="mapModelWithVehicles"
                        :key="mapModelKey" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import BirdViewMap from '../../maps/BirdViewMap.vue'
import { realTimeStore } from '@/stores/realTime'
import { ref, watch, computed } from 'vue'

const realTimeData = realTimeStore()
const mapModelKey = ref(Date.now())

const mapModelWithVehicles = computed(() => ({
  ...realTimeData.AGVC_TrafficStats_mapModel,
  Vehicles: (realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV || []).map(item => ({
    id: item.Name,
    x: item.CoordinateX,
    y: item.CoordinateY
  }))
}))

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
    display: flex;

    .dashboard-grid {
        flex: 1;
        display: grid;
        gap: 0.5rem;

        @media (max-width: 768px) {
            grid-template-columns: 1fr;
            grid-template-rows: repeat(4, minmax(350px, 1fr));
            height: auto;
            min-height: 100%;
            overflow-y: auto;
        }

        .grid-item {
            @media (max-width: 768px) {
                height: 350px; // 手机视图下的固定高度
            }
        }
    }
}
</style>