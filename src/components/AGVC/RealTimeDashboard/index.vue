<template>
    <div class="agvc-dashboard-scroll">
        <el-carousel height="auto" arrow="never" :autoplay="false">
            <el-carousel-item style="height: 100vh" :key="1"> 
                <el-row class="h-100" :gutter="5">
                    <el-col :lg="11" class="h-100 pt-2">
                        <div class="agvc-info h-100 d-flex flex-column justify-content-space-between">
                            <SystemStatusCard/>
                            <TaskListCard />
                            <EquipmentStatusCard @show-equipment-status="(payload) => $emit('show-equipment-status', payload)"/>
                        </div>
                    </el-col>
                    <el-col :lg="13" class="h-100 d-flex flex-column pt-2">
                        <CurrentAlertCard style="flex-shrink:0;" />
                        <HistoricalAlertCard/>
                        <BirdsEyeViewCard />
                    </el-col>
                </el-row>
            </el-carousel-item>
            <!-- <el-carousel-item style="height: 100vh" :key="2">
                <el-row class="h-100" :gutter="5">
                    <el-col :lg="8" class="h-100 pt-2">
                        <div class="agvc-info h-100 d-flex flex-column justify-content-space-between">
                            <SystemStatusCard />
                            <TaskListCard />
                            <EquipmentStatusCard />
                        </div>
                    </el-col>
                </el-row>
            </el-carousel-item> -->
        </el-carousel>
    </div>
</template>
<script setup lang="ts">
import SystemStatusCard from './components/SystemStatusCard.vue'
import TaskListCard from './components/TaskListCard.vue'
import EquipmentStatusCard from './components/EquipmentStatusCard.vue'
import CurrentAlertCard from './components/CurrentAlertCard.vue'
import HistoricalAlertCard from './components/HistoricalAlertCard.vue'
import BirdsEyeViewCard from './components/BirdsEyeViewCard.vue'
defineEmits(['show-equipment-status'])

</script>
<style scoped>
.agvc-dashboard-scroll {
    height: 100vh;
    overflow-y: auto;
}

.agvc-map {
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 10px;
}

.map-container {
    height: 100%;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #661;
}

.el-card {
    --el-card-border-color: #333;
    --el-card-bg-color: #1e1e1e;
}

:deep(.el-card__header) {
    border-bottom: 1px solid #333;
    padding: 10px;
}

:deep(.el-card__body) {
    padding: 10px;
}

.system-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-label {
    color: #909399;
    font-size: 14px;
}

.status-value {
    display: flex;
    align-items: center;
}

.status-icon {
    margin-right: 4px;
    vertical-align: middle;
}

:deep(.el-tag) {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    min-width: 90px;
}
:deep(.el-carousel__arrow) {
    top: calc(100vh - 145px);
    background-color: #00407569;
    &:hover {
        background-color: #004075;
    }
}
:deep(.el-card__header){
  span{
    font-size: var(--card-header-font-size) !important;
    font-weight: bold;
  }
}
</style>