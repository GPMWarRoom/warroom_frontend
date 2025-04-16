<template>
    <el-card class="">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>當前警報訊息</span>
            </div>
        </template>
        <transition name="fade">
            <div v-if="currentAlarm" class="alert-message text-danger">
                <span>{{ currentAlarm.Description_En }}</span>
            </div>
        </transition>
    </el-card>
</template> 

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { realTimeStore } from '/src/stores/realTime'

const realTimeData = realTimeStore()
const filteredAlarms = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_SystemAlarms.filter(item => item.Checked === false)
)
const currentAlarm = ref(filteredAlarms.value[0])
const currentAlarmIndex = ref(0)

let interval: number

onMounted(() => {
  interval = setInterval(() => {
    currentAlarmIndex.value = (currentAlarmIndex.value + 1) % filteredAlarms.value.length
    currentAlarm.value = filteredAlarms.value[currentAlarmIndex.value]
  }, 1500) // 每 3 秒切換
})

onUnmounted(() => {
  clearInterval(interval)
})

</script>

<style scoped>
.alert-message {
    border: 1px solid #333;
}
</style>