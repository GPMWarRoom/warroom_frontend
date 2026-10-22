<template>
    <div class="agvc-dashboard-scroll">
        <el-row class="w-100" :gutter="10">
            <el-col :lg="11" class="cards-container d-flex flex-column">
                <div class="agvc-info d-flex flex-column">
                    <SystemStatusCard />
                    <TaskListCard 
                        @realtime-action="(payload) => $emit('realtime-action', payload)"
                    />
                    <EquipmentStatusCard 
                        @show-equipment-status="(payload) => $emit('show-equipment-status', payload)"
                    />
                </div>
            </el-col>

            <el-col :lg="13" class="cards-container d-flex flex-column">
                <div class="agvc-info d-flex flex-column">
                    <CurrentAlertCard style="flex-shrink:0;" />
                    <HistoricalAlertCard
                        @realtime-action="(payload) => $emit('realtime-action', payload)"
                    />
                    <BirdsEyeViewCard />
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import SystemStatusCard from './components/SystemStatusCard.vue'
import TaskListCard from './components/TaskListCard.vue'
import EquipmentStatusCard from './components/EquipmentStatusCard.vue'
import CurrentAlertCard from './components/CurrentAlertCard.vue'
import HistoricalAlertCard from './components/HistoricalAlertCard.vue'
import BirdsEyeViewCard from './components/BirdsEyeViewCard.vue'

defineEmits(['show-equipment-status', 'realtime-action'])
</script>

<style scoped lang="scss">
.agvc-dashboard-scroll {
    /* 跟第一頁保持一致 */
    height: 100%;
    width: 100%;
    padding-top: 0.5rem;
    overflow-y: auto; /* 允許垂直捲動 */
    background-color: transparent;

    /* 美化 scrollbar (比照第一頁樣式) */
    &::-webkit-scrollbar {
        width: 8px;
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: var(--scrollbar-thumb);
        border-radius: 8px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: var(--border-strong);
    }

    scrollbar-width: thin;
    scrollbar-color: var(--scrollbar-thumb) transparent;
}

.agvc-info {
    /* 移除 h-100，改用 gap 控制間距 */
    gap: 10px;
}

/* 確保 Card 不會因為沒有固定高度而縮小 */
.el-card {
    flex-shrink: 0;
    width: 100%;
    --el-card-border-color: var(--card-border-color);
    --el-card-bg-color: var(--card-bg);
}

/* 修正地圖容器高度，避免在 auto 模式下消失 */
:deep(.birds-eye-view-card) {
    min-height: 400px; /* 給予一個基準高度 */
    flex: 1;
}

:deep(.el-card__header) {
    border-bottom: 1px solid var(--border-color);
    padding: 10px 16px;
    span {
        font-size: var(--card-header-font-size) !important;
        font-weight: bold;
    }
}

:deep(.el-card__body) {
    padding: 10px;
}
</style>