<template>
    <el-card class="my-2">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>歷史警報</span>
            </div>
        </template>
        <el-table :data="agvList" stripe style="height: 246px">
            <el-table-column prop="id" label="時間" width="120" />
            <el-table-column align="center" prop="status" label="等級" width="100">
                <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" show-overflow-tooltip prop="status" label="異常碼" width="100">
                <template>
                    <span>3303</span>
                </template>
            </el-table-column>
            <el-table-column prop="battery" label="警報訊息">
                <template>Message</template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<script setup lang="ts">
interface AGV {
    id: string
    status: string
    battery: number
}

defineProps<{
    agvList: AGV[]
}>()

const getStatusType = (status: string): string => {
    const types: Record<string, string> = {
        online: 'success',
        offline: 'danger',
        charging: 'warning'
    }
    return types[status] || 'info'
}
</script> 