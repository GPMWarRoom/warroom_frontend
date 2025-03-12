<template>
    <div class="agv-status border">
        <div class="status-grid">
            <!-- 左側區域：電池和里程 -->
            <div class="left-panel ">
                <div class="panel-section">
                    <BatteryStatus
                        :percentage="50"
                        :temperature="20"
                        :current="10"
                        :voltage="22.40" />
                </div>
                <div class="panel-section">
                    <Mileage
                        :total-mileage="100000"
                        :daily-mileage="3500"
                        :maintenance-mileage="95000"
                        :last-maintenance-date="new Date()" />
                </div>
                <div class="panel-section  flex-fill">
                    <TaskStats class="h-100"
                        :transport-tasks="transportTasks"
                        :charging-tasks="chargingTasks" />
                </div>
            </div>
            <!-- 右側區域：馬達狀態 -->
            <div class="right-panel">
                <MotorsStatus :motors="motors" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import BatteryStatus from './components/BatteryStatus.vue'
import MotorsStatus from './components/MotorsStatus.vue'
import Mileage from './components/Mileage.vue'
import TaskStats from './components/TaskStats.vue'

const motors = ref([
    {
        name: '左輪',
        current: 10,
        voltage: 12
    },

    {
        name: '右輪',
        current: 10,
        voltage: 12
    },
    {
        name: '升降馬達',
        current: 10,
        voltage: 12
    }
])
const transportTasks = ref({
    completed: 10,
    total: 20
})
const chargingTasks = ref({
    completed: 10,
    total: 20
})
</script>
<style scoped lang="scss">
.agv-status {
    width: 100%;
    height: var(--base-view-height);
    padding: var(--base-view-padding);
    overflow-y: auto;
}

.page-title {
    color: #fff;
    margin-bottom: 20px;
    font-size: 1.5rem;
}

.status-grid {
    display: grid;
    grid-template-columns: minmax(300px, 1fr) minmax(300px, 1.5fr);
    gap: 10px;
    height: 100%;
}

.left-panel {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 100%;
}


.panel-section {
    display: flex;
    justify-content: center;
    width: 100%;
    // background-color: pink;
}

.right-panel {
    display: flex;
    justify-content: center;
    height: fit-content;
}

// 響應式設計
@media (max-width: 1200px) {
    .status-grid {
        grid-template-columns: 1fr;
        gap: 1px;
    }

    .right-panel {
        margin-top: 0;
    }

    .left-panel {
        gap: 15px;
    }
}

// 確保組件寬度一致
:deep(.battery-status),
:deep(.mileage-status),
:deep(.motors-status),
:deep(.task-stats) {
    width: 100%;
    max-width: none;
}

// 暗色主題優化
:deep(.el-card) {
    background: #1e1e1e;
    border: 1px solid #333;

    .el-card__header {
        border-bottom: 1px solid #333;
    }
}
</style>