<template>
    <div class="agv-stats task-stats">
        <div class="header task-header">
            <h3>任務統計</h3>
            <!-- <el-tag type="info" size="small">{{ formatDate(new Date()) }}</el-tag> -->
        </div>
        <div class="stats-container">
            <!-- 總任務數 -->
            <div class="stat-card total">
                <div class="icon-wrapper">
                    <el-icon>
                        <List />
                    </el-icon>
                </div>
                <div class="info">
                    <div class="label">總任務數</div>
                    <div class="value">{{ totalTasks }}</div>
                    <el-progress
                        :percentage="completionRate"
                        :format="format"
                        :stroke-width="8" />
                </div>
            </div>
            <div class="tasks-grid">
                <!-- 搬運任務 -->
                <div class="stat-item">
                    <div class="stat-header">
                        <el-icon>
                            <Van />
                        </el-icon>
                        <span>搬運任務</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-numbers">
                            <span class="completed">{{ transportTasks.completed }}</span>
                            <span class="separator">/</span>
                            <span class="total">{{ transportTasks.total }}</span>
                        </div>
                        <el-progress
                            :percentage="(transportTasks.completed / transportTasks.total) * 100"
                            :stroke-width="8"
                            :show-text="false" />
                    </div>
                </div>
                <!-- 充電任務 -->
                <div class="stat-item">
                    <div class="stat-header">
                        <el-icon>
                            <Lightning />
                        </el-icon>
                        <span>充電任務</span>
                    </div>
                    <div class="stat-content">
                        <div class="stat-numbers">
                            <span class="completed">{{ chargingTasks.completed }}</span>
                            <span class="separator">/</span>
                            <span class="total">{{ chargingTasks.total }}</span>
                        </div>
                        <el-progress
                            :percentage="(chargingTasks.completed / chargingTasks.total) * 100"
                            :stroke-width="8"
                            :show-text="false" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface TaskCount {
    total: number
    completed: number
}

interface Props {
    transportTasks: TaskCount
    chargingTasks: TaskCount
}

const props = withDefaults(defineProps<Props>(), {
    transportTasks: () => ({ total: 0, completed: 0 }),
    chargingTasks: () => ({ total: 0, completed: 0 })
})

const totalTasks = computed(() =>
    props.transportTasks.total + props.chargingTasks.total
)

const completedTasks = computed(() =>
    props.transportTasks.completed + props.chargingTasks.completed
)

const completionRate = computed(() =>
    totalTasks.value ? (completedTasks.value / totalTasks.value) * 100 : 0
)

const format = (percentage: number) => `${completedTasks.value}/${totalTasks.value}`

const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
</script>
<style scoped>
.task-stats {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 15px;
    width: 100%;
}


.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.task-header h3 {
    margin: 0;
    color: #fff;
}

.stats-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.stat-card {
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
    font-size: 1.8em;
    font-weight: bold;
    margin-bottom: 10px;
}

.tasks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.stat-item {
    background: #2f2f2f;
    border-radius: 6px;
    padding: 15px;
}

.stat-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #909399;
    margin-bottom: 15px;
}

.stat-header .el-icon {
    color: #409EFF;
}

.stat-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.stat-numbers {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 5px;
    color: #fff;
}

.stat-numbers .completed {
    font-size: 1.8em;
    font-weight: bold;
    color: #409EFF;
}

.stat-numbers .separator {
    font-size: 1.2em;
    color: #606266;
}

.stat-numbers .total {
    font-size: 1.2em;
    color: #909399;
}

:deep(.el-progress-bar__inner) {
    transition: all 0.3s ease;
}

:deep(.el-progress--line) {
    margin-bottom: 0;
}

:deep(.el-progress__text) {
    color: #fff;
}
</style>