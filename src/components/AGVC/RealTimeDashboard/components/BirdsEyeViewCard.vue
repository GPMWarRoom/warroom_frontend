<template>
    <div class="traffic-stats-dashboard">
        <el-card class="bird-view-card-wrapper">
            <template #header>
                <div class="d-flex justify-content-between align-items-center">
                    <span>Bird's Eye View</span>
                    </div>
            </template>
            
            <div class="map-body">
                <BirdViewMap 
                    class="h-100 w-100" 
                    v-if="showMap"
                    mapId="map3" 
                    :map-model="mapModelWithVehicles"
                    :key="mapModelKey" 
                />
                <div v-else class="loading-placeholder">
                    載入地圖中...
                </div>
            </div>
        </el-card>
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
            // 使用 nextTick 或 setTimeout 確保 DOM 已渲染高度
            setTimeout(() => { 
                showMap.value = true 
                mapModelKey.value = Date.now()
            }, 50)
        }
    },
    { deep: true, immediate: true }
)
</script>

<style scoped lang="scss">
.traffic-stats-dashboard {
    width: 100%;
    height: auto;

    .bird-view-card-wrapper {
        /* 對齊 EquipmentStatusCard 的表格 300px + Header 高度 */
        /* 建議設定為與左邊卡片一致的固定高度 */
        height: 365px; 
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
            flex: 1;
            padding: 0; /* 地圖滿版 */
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
    }

    .map-body {
        flex: 1;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .loading-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
    }
}
</style>