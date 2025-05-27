<template>
  <div class="rack-status border">
    <div class="header-bar">
        <el-button link @click="router.back" :icon="Back" class="back-btn">
            返回
        </el-button>
        <div class="header-divider"></div>
        <span class="header-title">{{ currentEquipment.rack_name }}：</span>
    </div>
    <div
      class="rack-grid"
      :style="{
        gridTemplateRows: `repeat(${currentEquipment.row}, 250px)`,
        gridTemplateColumns: `repeat(${currentEquipment.col}, 350px)`
      }"
    >
      <template v-for="(rowIdx) in [...Array(currentEquipment.row).keys()].reverse()" :key="rowIdx">
        <template v-for="(colIdx) in [...Array(currentEquipment.col).keys()]" :key="colIdx">
          <div class="rack-cell">
            <div class="cell-header">
              <span class="cell-no">
                {{
                  (rowIdx * currentEquipment.col + colIdx + 1).toString().padStart(2, '0')
                }}
              </span>
              <el-tag
                size="small"
                effect="light"
                :type="cellAt(rowIdx, colIdx)?.IsEnable ? 'success' : 'danger'"
              >
                {{ cellAt(rowIdx, colIdx)?.IsEnable ? '啟用' : '禁用' }}
              </el-tag>
            </div>
            <div class="cell-content">
              <div class="cell-item">
                <span class="cell-label">貨物ID：</span>
                <span class="cell-value">
                  {{ cellAt(rowIdx, colIdx)?.MaterialID && cellAt(rowIdx, colIdx)?.MaterialID !== '' ? cellAt(rowIdx, colIdx)?.MaterialID : '-' }}
                </span>
              </div>
              <div class="cell-item">
                <span class="cell-label">貨物類別：</span>
                <span class="cell-value">{{ cellAt(rowIdx, colIdx)?.cargoType ?? '-' }}</span>
              </div>
              <div class="cell-item">
                <span class="cell-label">存放時間：</span>
                <span class="cell-value">
                  {{
                    (cellAt(rowIdx, colIdx)?.MaterialID && cellAt(rowIdx, colIdx)?.MaterialID !== '')
                      ? (cellAt(rowIdx, colIdx)?.UpdateTime ?? '-')
                      : '-'
                  }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { realTimeStore } from '@/stores/realTime'
import { ref, computed, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const realTimeData = realTimeStore()

function cellAt(row, col) {
  return currentEquipment.value?.items?.find(cell => cell.row === row && cell.col === col)
}

const equipmentId = ref(route.params.id)

watch(
  () => route.params.id,
  (newId) => {
    equipmentId.value = newId
  }
)

const currentEquipment = computed(() =>
  realTimeData.AGVC_RealTimeDashboard_EQStatus_Rack.find(
    item => item.rack_name === equipmentId.value
  )
)

</script>

<style scoped>

.header-divider {
  width: 1px;
  height: 24px;
  background: #4b5563; 
  margin: 0 8px;
}

.rack-status {
  width: 100%;
  height: var(--base-view-height);
  padding: var(--base-view-padding);
  overflow-y: auto;
}

:deep(.el-card) {
  background: #1e1e1e;
  border: 1px solid #333;

  .el-card__header {
    border-bottom: 1px solid #333;
  }
}


.header-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 5px;
  padding: 10px 20px; 
  background: #23272f;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  min-height: 10px; 
  margin: 5px 5px;
}

.back-btn {
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  font-size: 0.9rem;
}

.header-title {
  font-size: 1.0rem;
  font-weight: bold;
  color: #fff;
}


.rack-grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
  margin-left: 5px;
  overflow-x: auto;
}

.rack-cell {
  display: flex;
  flex-direction: column;
  padding: 10px;
  text-align: center;
  border-radius: 4px;
  font-size: 1.05rem;
  background-color: #1e1e1e;
  height: 100%;       
  box-sizing: border-box;
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-weight: bold;
  background: #23272f;    
  color: #fff;             
  border-radius: 4px;
  padding: 4px 8px;
}

.cell-no {
  color: #fff;
  font-size: 1.3rem;
}

.cell-content {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 0; 
}

.cell-item {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 0;
  overflow: hidden;
  padding: 0 4px;
}

.cell-label {
  color: #b3b3b3;
  font-size: 0.98rem;
  text-align: left;
}

.cell-value {
  color: #fff;
  font-size: 1rem;
  text-align: right;
  margin-left: 8px;
}

</style>
