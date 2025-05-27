<template>
    <el-card class="flex-grow-1" id="eq-status-card">
        <template #header>
            <div class="d-flex justify-content-between align-items-center">
                <span>設備狀態</span>
                <el-button-group>
                    <el-button
                        :type="currentTab === 'AGV' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'AGV'"
                    >AGV</el-button>
                    <el-button
                        :type="currentTab === 'mainEq' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'mainEq'"
                    >主要設備</el-button>
                    <el-button
                        :type="currentTab === 'chargingStation' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'chargingStation'"
                    >充電站</el-button>
                    <el-button
                        :type="currentTab === 'rack' ? 'primary' : 'info'"
                        size="small"
                        @click="currentTab = 'rack'"
                    >Rack</el-button>
                </el-button-group>
            </div>
        </template>
        <div v-if="currentTab==='AGV' "style="max-height: 300px; overflow-y: auto;">
            <el-table :data="realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV" stripe 
                        :style="{ height: tableHeight }"
                        @row-click="(row) => handleRowClick(row.Name, 'agv')">
                <el-table-column align="center" prop="Name" label="ID" width="90" />
                <el-table-column align="center" prop="MainStatus" label="狀態" width="110">
                    <template #default="{ row }">
                        <el-tag :type="StatusMap[row.StatusText]">{{ row.StatusText }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="連線狀態" width="110">
                    <template #default="{ row }">
                        <el-tag :type="row.Connected? 'success' : 'danger'">{{ row.Connected? 'online' : 'offline' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="BatLevel" label="電量">
                    <template #default="{ row }">
                        <el-progress :percentage="parseInt(row.BatLevel)" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="currentTab==='mainEq' "style="max-height: 300px; overflow-y: auto;">
            <el-table :data="realTimeData.AGVC_RealTimeDashboard_EQStatus_MainEQ" stripe :style="{ height: tableHeight }">
                <el-table-column align="center" prop="Name" label="ID" width="110" />
                <el-table-column align="center" prop="MainStatus" label="狀態" width="110">
                    <template #default="{ row }">
                        <el-tag :type="StatusMap[row.StatusText]">{{ row.StatusText }}</el-tag>
                    </template>
                </el-table-column>
                <<el-table-column align="center" prop="MaterialID" label="Material ID" />
            </el-table>
        </div>
        <div v-if="currentTab==='chargingStation' "style="max-height: 300px; overflow-y: auto;">
            <el-table :data="realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV" stripe :style="{ height: tableHeight }">
                <el-table-column align="center" prop="Name" label="ID" width="110" />
                <el-table-column align="center" prop="MainStatus" label="狀態" width="100">
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
        <div v-if="currentTab==='rack' "style="max-height: 300px; overflow-y: auto;">
            <el-table :data="realTimeData.AGVC_RealTimeDashboard_EQStatus_Rack" stripe 
                :style="{ height: tableHeight }"
                @row-click="(row) => handleRowClick(row.rack_name, 'rack')">
                <el-table-column align="center" prop="rack_name" label="ID" width="auto" />
                <el-table-column align="center" label="狀態" width="auto">
                    <template #default="{ row }">
                        <div style="display: flex; justify-content: center;">
                            <el-tag style="width: 100px;" :type="StatusMap[row.StatusText]">{{ row.StatusText }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentTab = ref<'AGV' | 'mainEq' | 'chargingStation' | 'rack'>('AGV')
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

const StatusMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    idle: 'warning',
    run: 'success',
    down: 'danger',
    charging: 'primary'
}

function handleRowClick(id: any, type: any) {
    router.push({ name: 'EquipmentStatus', params: { id: id, type:  type } })
}

</script>