<template>
    <el-card class="flex-grow-1" id="eq-status-card">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>設備狀態</span>
            </div>
        </template>
        <div style="max-height: 300px; overflow-y: auto;">
            <el-table :data="realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV" stripe :style="{ height: tableHeight }">
                <el-table-column prop="Name" label="ID" width="110" />
                <el-table-column prop="MainStatus" label="狀態" width="100">
                    <template #default="{ row }">
                        <el-tag :type="StatusMap[row.StatusText]">{{ row.StatusText }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="BatLevel" label="電量">
                    <template #default="{ row }">
                        <el-progress :percentage="row.BatLevel" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { realTimeStore } from '/src/stores/realTime'


const tableHeight = ref('300px')
const realTimeData = realTimeStore()
onMounted(() => {
    const card = document.getElementById('eq-status-card')
    if (card) {
        setTimeout(() => {
            tableHeight.value = (card.clientHeight * 0.8) + 'px'
        }, 200)
    }
})

const StatusMap: Record<string, string> = {
    online: 'success',
    offline: 'danger',
    charging: 'warning'
}
</script>