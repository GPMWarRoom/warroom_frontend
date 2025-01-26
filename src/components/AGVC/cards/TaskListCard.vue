<template>
    <el-card class="my-2">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>任務列表</span>
                <el-button-group>
                    <el-button type="primary" size="small">當前任務</el-button>
                    <el-button type="info" size="small">歷史記錄</el-button>
                </el-button-group>
            </div>
        </template>
        <el-table :data="taskList" stripe height="250px">
            <el-table-column show-overflow-tooltip prop="id" label="任務ID" width="120" />
            <el-table-column show-overflow-tooltip prop="type" label="類型" width="100" />
            <el-table-column show-overflow-tooltip prop="status" label="狀態" width="100">
                <template #default="{ row }">
                    <el-tag :type="getTaskStatusType(row.status)">{{ row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="progress" label="進度">
                <template #default="{ row }">
                    <el-progress :percentage="row.progress" />
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>

<script setup lang="ts">
interface Task {
    id: string
    type: string
    status: string
    progress: number
}

defineProps<{
    taskList: Task[]
}>()

const getTaskStatusType = (status: string): string => {
    const types: Record<string, string> = {
        processing: 'primary',
        waiting: 'warning',
        completed: 'success',
        failed: 'danger'
    }
    return types[status] || 'info'
}
</script> 