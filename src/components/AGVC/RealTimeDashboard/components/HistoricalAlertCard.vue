<template>
    <el-card class="my-2">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>歷史警報</span>
            </div>
        </template>
        <el-table :data="filteredAlarms" stripe style="height: 246px">
            <el-table-column prop="FormattedTime" label="時間" width="200" />
            <el-table-column align="center" prop="Level" label="等級" width="100">
                <template #default="{ row }">
                    <el-tag :type="row.Level === 1 ? 'danger' : 'warning'">{{ row.Level === 1 ? 'ALARM' : 'WARNING' }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" show-overflow-tooltip prop="AlarmCode" label="異常碼" width="100" />
            <el-table-column align="center" show-overflow-tooltip prop="Equipment_Name" label="設備" width="100" />
            <el-table-column label="警報訊息">
                <template #default="{ row }">
                    {{ row.Description_Zh }}({{ row.Description_En }})
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'

const realTimeData = realTimeStore()
const filteredAlarms = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_SystemAlarms.filter(item => item.Checked === true)
)

</script>