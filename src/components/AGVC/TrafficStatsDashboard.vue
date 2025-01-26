<template>
    <div class="traffic-stats-dashboard">
        <div class="dashboard-grid">
            <div class="grid-item">
                <div class="card">
                    <h3>停等狀態統計</h3>
                    <div class="content">
                        <PathUseStatsMap class="h-100 w-100" mapId="map1" :map-model="mapModel" />
                    </div>
                </div>
            </div>
            <div class="grid-item">
                <div class="card">
                    <h3>路線使用統計</h3>
                    <div class="content">
                        <PathUseStatsMap class="h-100 w-100" mapId="map2" :map-model="mapModel" />
                    </div>
                </div>
            </div>
            <div class="grid-item">
                <div class="card">
                    <h3>Statistics 2</h3>
                    <div class="content"> Content 3 </div>
                </div>
            </div>
            <div class="grid-item">
                <div class="card">
                    <h3>Statistics 3</h3>
                    <div class="content"> Content 4 </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PathUseStatsMap from './maps/PathUseStatsMap.vue'
import { getMap } from '../../api/map'
import { defaultMapModel } from '../../models/MapModel'

const mapModel = ref<typeof defaultMapModel>(defaultMapModel)

onMounted(async () => {
    const res = await getMap()
    mapModel.value = res
})
</script>
<style scoped lang="scss">
.traffic-stats-dashboard {
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    display: flex;

    .dashboard-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
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