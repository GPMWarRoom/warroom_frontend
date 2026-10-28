<template>
    <div class="agvc-dashboard-scroll">
        <!-- 系統狀態＋當前警報訊息：橫跨兩欄放最上方，下方卡片因此有更多高度 -->
        <SystemStatusCard class="status-bar" />
        <el-row :gutter="10">
            <!-- 左欄：設備狀態固定顯示 4 筆，AGVS Layout 填滿剩下的高度（左右欄各佔一半） -->
            <el-col :lg="12" class="cards-container d-flex flex-column">
                <div class="agvc-info d-flex flex-column">
                    <EquipmentStatusCard class="eq-fixed"
                        @show-equipment-status="(payload) => $emit('show-equipment-status', payload)"
                    />
                    <BirdsEyeViewCard class="fill-card" />
                </div>
            </el-col>

            <!-- 右欄：任務列表、歷史警報等高 -->
            <el-col :lg="12" class="cards-container d-flex flex-column">
                <div class="agvc-info d-flex flex-column">
                    <TaskListCard class="fill-card"
                        @realtime-action="(payload) => $emit('realtime-action', payload)"
                    />
                    <HistoricalAlertCard class="fill-card"
                        @realtime-action="(payload) => $emit('realtime-action', payload)"
                    />
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import SystemStatusCard from './components/SystemStatusCard.vue'
import TaskListCard from './components/TaskListCard.vue'
import EquipmentStatusCard from './components/EquipmentStatusCard.vue'
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
    overflow-x: hidden; /* el-row 的 gutter 負邊距會超出左右各 5px，避免出現水平捲軸 */
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

.status-bar {
    margin-bottom: 10px;
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

/* 設備狀態高度由表格決定（固定 4 筆），不隨欄高伸縮；蓋過卡片本身 Bootstrap 的 flex-grow-1 */
.agvc-info > .eq-fixed {
    flex: none !important;
}

/*
 * 寬螢幕（左右兩欄並排）時與其他頁籤相同：整頁剛好填滿畫面，不需往下捲。
 * 最上方的系統狀態列依內容高度；左欄設備狀態固定 4 筆、AGVS Layout 填滿其餘高度，右欄任務列表與歷史警報平分高度。
 * 畫面太矮時保留最小高度，改由外層捲動。
 */
@media (min-width: 1200px) {
    .agvc-dashboard-scroll {
        display: flex;
        flex-direction: column;
    }

    .status-bar {
        flex: none;
    }

    .agvc-dashboard-scroll > .el-row {
        flex: 1;
        min-height: 0;
    }

    .cards-container {
        height: 100%;
    }

    .agvc-info {
        flex: 1;
        min-height: 0;
    }

    .agvc-info > .fill-card {
        flex: 1 1 0;
        min-height: 200px;
        height: auto;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
    }

    /* AGVS Layout：地圖卡片撐滿外層 */
    .agvc-dashboard-scroll .agvc-info > .fill-card :deep(.bird-view-card-wrapper) {
        height: 100%;
    }
}
</style>