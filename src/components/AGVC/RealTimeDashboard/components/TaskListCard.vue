<template>
    <el-card class="my-2">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>任務列表</span>
                <el-button-group>
                    <el-button
                        :type="currentTab === 'current' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'current'"
                    >當前任務</el-button>
                    <el-button
                        :type="currentTab === 'completed' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'completed'"
                    >歷史記錄</el-button>
                </el-button-group>
            </div>
        </template>
        <el-table :data="filteredTasks" stripe height="250px">
            <el-table-column show-overflow-tooltip prop="DesignatedAGVName" label="AGV" width="auto" align="center"/>
            <el-table-column show-overflow-tooltip prop="TaskName" label="任務ID" width="120" align="center" />
            <el-table-column show-overflow-tooltip prop="Action" label="類型" width="100" align="center">
                <template #default="{ row }">
                    {{ actionMap[row.Action] }}
                </template>
            </el-table-column>
            <el-table-column show-overflow-tooltip prop="State" label="狀態" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="getTaskStatusType(row.State)">{{ stateMap[row.State] }}</el-tag>
                </template>
            </el-table-column>
            <!-- <el-table-column prop="progress" label="進度">
                <template #default="{ row }">
                    <el-progress :percentage="row.progress" />
                </template>
            </el-table-column> -->
        </el-table>
    </el-card>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { realTimeStore } from '@/stores/realTime'

const realTimeData = realTimeStore()
const currentTab = ref<'current' | 'completed'>('current')

const filteredTasks = computed(() => {
  const tasks = realTimeData.AGVC_RealTimeDashboard_Tasks || []
  return tasks.filter(task => {
    return currentTab.value === 'current'
      ? task.IsCompleted === 0
      : task.IsCompleted === 1
  })
})

const taskStatustypes: Record<number, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    1: 'primary',
    4: 'success',
    5: 'warning',
    6: 'danger'
}

const getTaskStatusType = (status: number): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  return taskStatustypes[status] ?? 'info'
}

const actionMap: Record<number, string> = {
    0: '移動', 
    1: '取貨', 
    7: '放貨', 
    8: '充電', 
    9: '搬運', 
}

const stateMap: Record<number, string> = {
    1: 'processing', 
    4: 'completed', 
    5: 'waiting', 
    6: 'failed', 
    7: 'canceled', 
}

</script>