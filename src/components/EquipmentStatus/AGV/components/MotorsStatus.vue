<template>
    <div class="agv-stats motors-status">
        <div class="header motors-header">
            <h3>馬達狀態</h3>
            <el-tag :type="motorHealthStatus" size="small">{{ motorHealth }}</el-tag>
        </div>
        <div class="motors-grid">
            <div v-for="(motor, index) in motors" :key="index" class="motor-card">
                <div class="motor-title">
                    <el-icon>
                        <Van />
                    </el-icon>
                    <span> {{ motor.name || '馬達' + (index + 1) }}</span>
                </div>
                <div class="motor-stats">
                    <div class="stat-item">
                        <div class="stat-label">
                            <el-icon>
                                <Lightning />
                            </el-icon> 電流
                        </div>
                        <div class="stat-value" :class="{ warning: motor.current > currentThreshold }"> {{ motor.current.toFixed(1) }}A </div>
                        <el-progress
                            :percentage="(motor.current / currentThreshold) * 100"
                            :status="motor.current > currentThreshold ? 'exception' : 'normal'"
                            :stroke-width="8"
                            :show-text="false" />
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">
                            <el-icon>
                                <Monitor />
                            </el-icon> 電壓
                        </div>
                        <div class="stat-value" :class="{ warning: motor.voltage < voltageThreshold }"> {{ motor.voltage.toFixed(1) }}V </div>
                        <el-progress
                            :percentage="(motor.voltage / maxVoltage) * 100"
                            :status="motor.voltage < voltageThreshold ? 'exception' : 'normal'"
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

interface Motor {
    name: string
    current: number
    voltage: number
}

interface Props {
    motors: Motor[]
    currentThreshold?: number
    voltageThreshold?: number
    maxVoltage?: number
}

const props = withDefaults(defineProps<Props>(), {
    motors: () => [
        { name: '馬達1', current: 0, voltage: 0 },
        { name: '馬達2', current: 0, voltage: 0 }
    ],
    currentThreshold: 30,
    voltageThreshold: 22,
    maxVoltage: 28

})

const motorHealth = computed(() => {
    const hasHighCurrent = props.motors.some(m => m.current > props.currentThreshold)
    const hasLowVoltage = props.motors.some(m => m.voltage < props.voltageThreshold)

    if (hasHighCurrent) return '過載'
    if (hasLowVoltage) return '電壓過低'
    return '正常'
})

const motorHealthStatus = computed(() => {
    const hasHighCurrent = props.motors.some(m => m.current > props.currentThreshold)
    const hasLowVoltage = props.motors.some(m => m.voltage < props.voltageThreshold)

    if (hasHighCurrent || hasLowVoltage) return 'danger'
    return 'success'
})
</script>
<style scoped>
.motors-status {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 15px;
    width: 100%;
}

.motors-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.motors-header h3 {
    margin: 0;
    color: #fff;
}

.motors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
    gap: 15px;
}

.motor-card {
    background: #2f2f2f;
    border-radius: 6px;
    padding: 15px;
}

.motor-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    margin-bottom: 15px;
    font-weight: bold;
}

.motor-title .el-icon {
    color: #409EFF;
}

.motor-stats {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.stat-item {
    background: #1e1e1e;
    border-radius: 6px;
    padding: 10px;
}

.stat-label {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #909399;
    font-size: 0.9em;
    margin-bottom: 5px;
}

.stat-label .el-icon {
    color: #409EFF;
}

.stat-value {
    color: #fff;
    font-size: 1.2em;
    font-weight: bold;
    margin-bottom: 5px;
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