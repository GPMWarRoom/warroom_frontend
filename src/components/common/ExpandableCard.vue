<template>
    <div class="card">
        <h3 class="expandable-card-header">
            <span class="expandable-card-title">{{ title }}</span>
            <div class="expandable-card-actions">
                <slot name="actions" />
                <el-tooltip content="放大檢視" placement="top">
                    <el-icon class="expand-icon" @click="isExpanded = true"><FullScreen /></el-icon>
                </el-tooltip>
            </div>
        </h3>
        <div class="content">
            <slot />
        </div>

        <!-- 放大檢視：同一份圖表在彈窗內重新畫一次，標題列的控制項也一起帶過去（與卡片上的同步） -->
        <el-dialog
            v-model="isExpanded"
            width="90%"
            top="5vh"
            :destroy-on-close="true"
            append-to-body
        >
            <template #header>
                <div class="expandable-card-header dialog-header">
                    <span class="expandable-card-title">{{ title }}</span>
                    <div class="expandable-card-actions">
                        <slot name="actions" />
                    </div>
                </div>
            </template>
            <div class="expanded-content">
                <slot v-if="isExpanded" />
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'

defineProps<{ title: string }>()

const isExpanded = ref(false)
</script>

<style scoped>
.expandable-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.expandable-card-title {
    white-space: nowrap;
}

.expandable-card-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    font-weight: normal;
}

.expand-icon {
    cursor: pointer;
    font-size: 16px;
    color: var(--text-muted);
    transition: color 0.2s;
}

.expand-icon:hover {
    color: var(--accent-color);
}

/* 彈窗標題列：右側留位置給關閉按鈕 */
.dialog-header {
    padding-right: 36px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
}

.expanded-content {
    height: 75vh;
}
</style>
