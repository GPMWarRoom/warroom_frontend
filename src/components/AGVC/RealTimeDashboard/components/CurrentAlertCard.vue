<template>
    <el-card class="">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>當前警報訊息</span>
            </div>
        </template>
        <transition name="fade">
            <div v-if="currentAlarm" class="alert-message text-danger">
                <span>[time: {{ currentAlarm.FormattedTime }}] [code: {{ currentAlarm.AlarmCode }}] [equipment: {{currentAlarm.Equipment_Name}}]
                 [{{currentAlarm.Description_Zh}}({{currentAlarm.Description_En}})]
                </span>
            </div>
        </transition>
    </el-card>
</template> 

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { realTimeStore } from '@/stores/realTime'

const realTimeData = realTimeStore()
const filteredAlarms = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_SystemAlarms.filter(item => item.Checked === false)
)
const currentAlarm = ref(filteredAlarms.value[0])
const currentAlarmIndex = ref(0)

let interval: ReturnType<typeof setInterval>

onMounted(() => {
  interval = setInterval(() => {
    currentAlarmIndex.value = (currentAlarmIndex.value + 1) % filteredAlarms.value.length
    currentAlarm.value = filteredAlarms.value[currentAlarmIndex.value]
  }, 2500) // 每 2.5 秒切換
})

onUnmounted(() => {
  clearInterval(interval)
})

</script>

<style scoped>
.alert-message {
  border: 1px solid #333;
  padding: 8px 12px;
  font-size: 1rem;
  word-break: break-all;
}
</style>