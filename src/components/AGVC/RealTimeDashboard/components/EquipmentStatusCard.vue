<template>
    <el-card class="flex-grow-1" id="eq-status-card">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>設備狀態</span>
            </div>
        </template>
        <el-table :data="agvList" stripe :style="{ height: tableHeight }">
            <el-table-column prop="id" label="ID" width="110" />
            <el-table-column prop="status" label="狀態" width="100">
                <template #default="{ row }">
                    <el-tag>{{ row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="battery" label="電量">
                <template #default="{ row }">
                    <el-progress :percentage="row.battery" />
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface AGV {
    id: string
    status: string
    battery: number
}

defineProps<{
    agvList: AGV[]
}>()

const tableHeight = ref('300px')

onMounted(() => {
    const card = document.getElementById('eq-status-card')
    if (card) {
        setTimeout(() => {
            tableHeight.value = (card.clientHeight * 0.8) + 'px'
        }, 200)
    }
})

const getStatusType = (status: string): string => {
    const types: Record<string, string> = {
        online: 'success',
        offline: 'danger',
        charging: 'warning'
    }
    return types[status] || 'primary'
}
</script>