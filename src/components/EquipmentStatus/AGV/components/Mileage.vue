<template>
    <div class="agv-stats mileage-status">
        <div class="header mileage-header ">
            <h3>里程資訊</h3>
            <el-tag type="info" size="small">{{ formatDate(lastMaintenanceDate) }}</el-tag>
        </div>
        <div class="mileage-content">
            <div class="mileage-card total">
                <div class="icon-wrapper">
                    <el-icon>
                        <Odometer />
                    </el-icon>
                </div>
                <div class="info">
                    <div class="label">總里程</div>
                    <div class="value">{{ formatDistance(totalMileage) }}</div>
                </div>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <el-icon>
                            <Timer />
                        </el-icon>
                        <span>當日里程</span>
                    </div>
                    <div class="stat-value">{{ formatDistance(dailyMileage) }}</div>
                    <el-progress
                        :percentage="(dailyMileage / dailyTarget) * 100"
                        :status="dailyMileage > dailyTarget ? 'success' : ''"
                        :stroke-width="8"
                        :show-text="false" />
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <el-icon>
                            <Tools />
                        </el-icon>
                        <span>保養里程</span>
                    </div>
                    <div class="stat-value" :class="{ warning: maintenanceMileage >= maintenanceThreshold }"> {{ formatDistance(maintenanceMileage) }} </div>
                    <el-progress
                        :percentage="(maintenanceMileage / maintenanceThreshold) * 100"
                        :status="maintenanceMileage >= maintenanceThreshold ? 'exception' : 'success'"
                        :stroke-width="8"
                        :show-text="false" />
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    totalMileage: number        // 總里程(公尺)
    dailyMileage: number        // 當日里程(公尺)
    maintenanceMileage: number  // 距離上次保養里程(公尺)
    lastMaintenanceDate: Date   // 上次保養日期
    dailyTarget?: number        // 每日目標里程
    maintenanceThreshold?: number // 保養里程閾值
}

const props = withDefaults(defineProps<Props>(), {
    totalMileage: 0,
    dailyMileage: 0,
    maintenanceMileage: 0,
    lastMaintenanceDate: () => new Date(),
    dailyTarget: 5000,          // 預設 5公里
    maintenanceThreshold: 100000 // 預設 100公里
})

const formatDistance = (meters: number) => {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`
    }
    return `${meters.toFixed(0)} m`
}

const formatDate = (date: Date) => {
    return `上次保養: ${date.toLocaleDateString()}`
}
</script>
<style scoped>
.mileage-status {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 15px;
    width: 100%;
}

.mileage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.mileage-header h3 {
    margin: 0;
    color: #fff;
}

.mileage-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.mileage-card {
    background: #2f2f2f;
    border-radius: 6px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.icon-wrapper {
    background: #409EFF;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.icon-wrapper .el-icon {
    font-size: 24px;
    color: white;
}

.info {
    flex: 1;
}

.info .label {
    color: #909399;
    font-size: 0.9em;
    margin-bottom: 5px;
}

.info .value {
    color: #fff;
    font-size: 1.5em;
    font-weight: bold;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.stat-card {
    background: #2f2f2f;
    border-radius: 6px;
    padding: 15px;
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #909399;
    margin-bottom: 10px;
}

.stat-header .el-icon {
    color: #409EFF;
}

.stat-value {
    color: #fff;
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 10px;
}

.stat-value.warning {
    color: #E6A23C;
}

:deep(.el-progress-bar__inner) {
    transition: all 0.3s ease;
}

:deep(.el-progress--line) {
    margin-bottom: 0;
}
</style>