<template>
    <content-container>
        <div class="h-100 ">
            <el-tabs v-model="activeTab" class="agvc-tabs" type="card">
                <el-tab-pane label="即時監控" name="monitor">
                    <template #label>
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>即時監控</span>
                    </template>
                    <RealTimeDashboard class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-stats">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>交管狀態</span>
                    </template>
                    <TrafficStatsDashboard class="tab-content-component" />
                </el-tab-pane>
                <el-tab-pane :lazy="true" name="traffic-efficiency">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>搬運效能統計</span>
                    </template>
                    <TrafficEfficiencyDashboard class="tab-content-component" />
                </el-tab-pane>
                <!-- <el-tab-pane label="任務管理" name="tasks">
                    <template #label>
                        <el-icon>
                            <List />
                        </el-icon>
                        <span>任務管理</span>
                    </template>
                    <AGVCMonitor class="tab-content-component" v-if="activeTab === 'tasks'" />
                </el-tab-pane>
                <el-tab-pane label="系統設定" name="settings">
                    <template #label>
                        <el-icon>
                            <Setting />
                        </el-icon>
                        <span>系統設定</span>
                    </template>
                    <AGVCMonitor class="tab-content-component" v-if="activeTab === 'settings'" />
                </el-tab-pane> -->
            </el-tabs>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Monitor, List } from '@element-plus/icons-vue'
import ContentContainer from '../components/ContentContainer.vue'
import RealTimeDashboard from '../components/AGVC/RealTimeDashboard/index.vue'
import TrafficStatsDashboard from '../components/AGVC/TrafficStatsDashboard/index.vue'
import TrafficEfficiencyDashboard from '../components/AGVC/TrafficEffiencicyDashboard/index.vue'
const activeTab = ref('monitor')
</script>
<style scoped>
.agvc-tabs {
    --tab-offset-top: 111px;
    padding: 0 10px;
    margin-bottom: 10px;
}

.agvc-tabs .tab-content-component {
    height: calc(100vh - var(--tab-offset-top));
    padding-bottom: 2px;
}

.agvc-tabs :deep(.el-tabs__header) {
    margin: 0;
}

.agvc-tabs :deep(.el-tabs__content) {
    height: calc(100vh - var(--tab-offset-top));
    overflow-y: auto;
    /* border: 4px solid #cc00ff; */
}

.agvc-tabs :deep(.el-tabs__nav) {
    border: none;
}

.agvc-tabs :deep(.el-tabs__item) {
    color: #909399;
    border: 1px solid #333;
    margin-right: 4px;
    height: 32px;
    line-height: 32px;
}

.agvc-tabs :deep(.el-tabs__item.is-active) {
    background-color: #409EFF;
    border-color: #409EFF;
    color: #fff;
}

.agvc-tabs :deep(.el-tabs__item:hover) {
    color: #409EFF;
}

.agvc-tabs :deep(.el-tabs__item.is-active:hover) {
    color: #fff;
}

.agvc-tabs :deep(.el-icon) {
    margin-right: 4px;
    vertical-align: middle;
}
</style>