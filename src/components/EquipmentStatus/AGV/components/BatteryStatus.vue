<template>
    <div class="agv-stats battery-status">
        <div class="header battery-header">
            <h3>電池狀態</h3>
            <el-tag :type="batteryHealthStatus" size="small">{{ batteryHealth }}</el-tag>
        </div>
        <div class="battery-container">
            <div class="battery-visual">
                <div class="battery-body">
                    <div class="battery-level" :style="{ width: `${percentage}%`, backgroundColor: levelColor }"></div>
                </div>
                <div class="battery-cap"></div>
            </div>
            <div class="battery-percentage">{{ percentage }}%</div>
        </div>
        <div class="battery-details">
            <div class="detail-item">
                <el-icon>
                    <Cpu />
                </el-icon>
                <span class="label">溫度</span>
                <span class="value" :class="{ warning: temperature > 45 }"> {{ temperature }}°C </span>
            </div>
            <div class="detail-item">
                <el-icon>
                    <Lightning />
                </el-icon>
                <span class="label">電流</span>
                <span class="value">{{ current }}A</span>
            </div>
            <div class="detail-item">
                <el-icon>
                    <Monitor />
                </el-icon>
                <span class="label">電壓</span>
                <span class="value">{{ voltage }}V</span>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    percentage: number
    temperature: number
    current: number
    voltage: number
}

const props = withDefaults(defineProps<Props>(), {
    percentage: 0,
    temperature: 0,
    current: 0,
    voltage: 0
})

const levelColor = computed(() => {
    if (props.percentage <= 20) return '#ff4757'
    if (props.percentage <= 40) return '#ffa502'
    return '#2ed573'
})

const batteryHealth = computed(() => {
    if (props.temperature > 45) return '過熱'
    if (props.percentage <= 20) return '低電量'
    return '正常'
})

const batteryHealthStatus = computed(() => {
    if (props.temperature > 45) return 'danger'
    if (props.percentage <= 20) return 'warning'
    return 'success'
})
</script>
<style scoped>
.battery-status {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 15px;
    width: 100%;
}

.battery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.battery-header h3 {
    margin: 0;
    color: #fff;
}

.battery-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.battery-visual {
    display: flex;
    align-items: center;
    flex: 1;
}

.battery-body {
    width: 100%;
    height: 30px;
    border: 2px solid #fff;
    border-radius: 4px;
    overflow: hidden;
    background: #2f2f2f;
}

.battery-level {
    height: 100%;
    transition: all 0.3s ease;
}

.battery-cap {
    width: 3px;
    height: 15px;
    background: #fff;
    margin-left: 3px;
    border-radius: 0 2px 2px 0;
}

.battery-percentage {
    color: #fff;
    font-size: 1.2em;
    font-weight: bold;
    min-width: 60px;
}

.battery-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 15px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    background: #2f2f2f;
    border-radius: 6px;
    color: #fff;
}

.detail-item .el-icon {
    font-size: 1.5em;
    margin-bottom: 5px;
    color: #409EFF;
}

.label {
    font-size: 0.8em;
    color: #909399;
    margin-bottom: 3px;
}

.value {
    font-weight: bold;
}

.value.warning {
    color: #E6A23C;
}

.warning {
    color: #E6A23C;
}
</style>