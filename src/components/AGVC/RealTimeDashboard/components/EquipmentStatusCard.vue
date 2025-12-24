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
                    <el-button v-if="false" 
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
                        <el-progress :percentage="parseInt(row.BatLevel) || 0" />
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
                        <el-progress :percentage="row.BatLevel || 0" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div v-if="currentTab==='rack' "style="max-height: 300px; overflow-y: auto;">
            <el-table :data="realTimeData.AGVC_RealTimeDashboard_EQStatus_Rack" stripe 
                :style="{ height: tableHeight }"
                :row-class-name="tableRowClassName"
                @row-click="(row) => handleRowClick(row.rack_name, 'rack')">
                <el-table-column align="center" prop="rack_name" label="ID" width="100" />
                <el-table-column align="center" label="狀態" width="auto">
                    <template #default="{ row }">
                        <div style="display: flex; justify-content: center;">
                            <el-tag style="width: 80px;" :type="StatusMap[row.StatusText]">{{ row.StatusText }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="waterLevel" label="水位">
                    <template #default="{ row }">
                        <el-progress :percentage="row.waterLevel*100 || 0"/>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </el-card>
</template>
<script setup lang="ts">
import { ref, onActivated, onDeactivated } from 'vue'
import { realTimeStore } from '@/stores/realTime'

const tableRowClassName = ({ row }) => {
    if (Array.isArray(row.items) && row.items.some(item => item.alarm)) {
        return 'row-danger'
    }
    if (row.hasManualItem) {
        return 'row-warning'
    }
    return ''
}

const currentTab = ref<'AGV' | 'mainEq' | 'chargingStation' | 'rack'>('AGV')
const tableHeight = ref('300px')
const realTimeData = realTimeStore()
const MANUAL_TIMEOUT_SEC = 600

const checkManualTimeout = () => {
    const now = Date.now()
    realTimeData.AGVC_RealTimeDashboard_EQStatus_Rack.forEach(rack => {
    if (Array.isArray(rack.items)) {
      rack.items.forEach(item => {
        if (item.isManualItem && item.UpdateTime) {
          const update = new Date(item.UpdateTime).getTime()
          item.alarm = ((now - update) / 1000) > MANUAL_TIMEOUT_SEC
        } else {
          item.alarm = false
        }
      })
    }
  })
}

let timer: ReturnType<typeof setInterval> | null = null

onActivated(() => {
  checkManualTimeout()
  timer = setInterval(checkManualTimeout, 2000)
})

onDeactivated(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

const StatusMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    idle: 'warning',
    run: 'success',
    down: 'danger',
    charging: 'primary'
}

const emit = defineEmits(['show-equipment-status'])

const handleRowClick = (id: any, type: any) => {
  emit('show-equipment-status', { id, type })
}

</script>

<style scoped>
::v-deep .row-warning:not(.row-danger) > td:first-child {
  border-left: 1px solid #fdc84c !important;
}
::v-deep .row-warning:not(.row-danger) > td {
  background-color: #fdc84c3f !important;
  background-clip: padding-box !important;
  transition: background-color 0.2s;
}
::v-deep .row-warning:not(.row-danger):hover > td {
  background-color: #fdc84c8f !important;
}
::v-deep .row-danger > td:first-child {
  border-left: 1px solid #ff4d4f !important;
}
::v-deep .row-danger > td {
  background-color: #ff4d5031 !important; /* 紅色透明底 */
  background-clip: padding-box !important;
  transition: background-color 0.2s;
}
::v-deep .row-danger:hover > td {
  background-color: #ff4d508e !important;
}
</style>