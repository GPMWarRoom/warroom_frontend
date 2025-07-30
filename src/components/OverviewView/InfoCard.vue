<template>
  <div class="floor-container">
    <div 
      v-if="realTimeData.Overview_Data"
      v-for="floor in Object.keys(realTimeData.Overview_Data).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))"
      :key="floor"
      class="floor-section"
    >
      <h2 class="floor-title">{{ floor }}</h2>
      <div class="zone-row">
        <div
          v-for="(devices, zone) in realTimeData.Overview_Data[floor]"
          :key="zone"
          class="device-card"
          :class="{
            'has-alarm': devices.SystemAlarms?.length,
            'not-alive': !devices.Alive.isAlive || !devices.Alive.isVMSAlive,
          }"
          @dblclick="gotoAGVC(devices.Channel)"
        >
          <template v-if="devices.SystemAlarms?.length > 0 || (!devices.Alive.isAlive || !devices.Alive.isVMSAlive)">
            {{ alarmStore.playAlarm() }}
          </template>
          <template v-else>
            {{ alarmStore.stopAlarm() }}
          </template>
          <div class="device-header">
            <div class="zone-title">{{floor}} - {{ zone }}</div>
            <div class="error-tag">
              <template v-if="devices.SystemAlarms && devices.SystemAlarms.length">
                <el-tag type="danger" effect="plain" size="small">警報</el-tag>
              </template>
              <template v-if="!devices.Alive.isAlive">
                <el-tag type="warning" effect="plain" size="small">通訊異常</el-tag>
              </template>
              <template v-if="!devices.Alive.isVMSAlive">
                <el-tag type="warning" effect="plain" size="small">派車系統異常</el-tag>
              </template>
            </div>
          </div>

          <div
            v-for="device in devices.SysStatus"
            :key="device.FieldName"
            class="device-status"
          >
            <div class="status-item">
              <div class="status-label">系統運轉</div>
              <el-switch :model-value="!!device.RunMode" disabled />
              <div class="status-desc">{{ device.RunMode ? '運轉' : '維護' }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">Host 連線</div>
              <el-switch :model-value="!!device.HostConnMode" disabled />
              <div class="status-desc">{{ device.HostConnMode ? 'ONLINE' : 'OFFLINE' }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">命令派送</div>
              <el-switch :model-value="!!device.HostOperMode" disabled />
              <div class="status-desc">{{ device.HostOperMode ? 'REMOTE' : 'LOCAL' }}</div>
            </div>
          </div>

          <div v-if="devices.SystemAlarms?.length" class="alarm-area">
            <el-icon color="#ff4d4f" style="margin-right:2px;"><WarningFilled /></el-icon>
            <ul class="alarm-list">
              <li v-for="alarm in devices.SystemAlarms" :key="alarm.AlarmCode">
                <span class="alarm-time">{{ alarm.FormattedTime }}</span>
                <span class="alarm-desc">{{ alarm.Description_Zh }}</span>
              </li>
            </ul>
          </div>

          <div v-if="devices.EQStatus_AGV?.length" class="agv-status">
            <strong></strong>
            <div
              v-for="agv in devices.EQStatus_AGV"
              :key="agv.Name"
              class="agv-card"
            >
              <div class="agv-header">
                <span
                  class="agv-status-dot"
                  :class="agv.Connected ? 'online' : 'offline'"
                  title="連線狀態"
                ></span>
                <span class="agv-name">{{ agv.Name }}</span>
                <span class="agv-state-text" v-if="agv.Connected">
                  <el-tag
                    :type="getAgvStatusType(agv.Status)"
                    size="small"
                    effect="plain"
                    disable-transitions
                  >
                    {{ agv.Status }}
                  </el-tag>
                </span>
              </div>
              <div class="agv-battery-row" v-if="agv.Connected">
                <el-progress
                  :percentage="agv.BatLevel"
                  :color="getBatteryColor(agv.BatLevel)"
                  :stroke-width="14"
                  style="width: 100%; margin: 0;"
                  status="success"
                  :show-text="false"
                />
                <span
                  class="battery-text"
                  :class="{
                    green: agv.BatLevel > 60,
                    yellow: agv.BatLevel <= 60 && agv.BatLevel > 30,
                    red: agv.BatLevel <= 30
                  }"
                >
                  {{ agv.BatLevel.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { watch, computed } from 'vue'
import { realTimeStore } from '@/stores/realTime'
import { useRouter } from 'vue-router'
import { useAlarmStore } from '@/stores/alert'
const alarmStore = useAlarmStore()
const router = useRouter()
const realTimeData = realTimeStore()

function gotoAGVC(agvc: string) {
  realTimeData.selectedAgvc = agvc
  router.push('/AGVC')
}
function getBatteryColor(level: number) {
  if (level > 60) return '#81c784';      // 綠色
  if (level > 30) return '#ffe066';      // 黃色
  return '#e57373';                      // 紅色
}
function getAgvStatusType(status) {
  switch (status) {
    case 'RUN':
      return 'success'
    case 'IDLE':
      return 'warning'
    case 'CHARGING':
      return 'primary'
    case 'DOWN':
      return 'danger'
    default:
      return 'info' // 或 'primary'
  }
}
</script>

<style scoped>
.floor-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.floor-title {
  font-size: 24px;
  color: #fff;
  margin-bottom: 12px;
}
.zone-title {
  font-size: 18px;
  color: #5a90bd;
  font-weight: 600;
}
.zone-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.device-card {
  background-color: #333;
  border-radius: 12px;
  padding: 16px;
  width: 340px;
  color: #eee;
  border: 1px solid #444;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  max-height: 420px;         /* 你可以依需求調整高度 */
  overflow-y: auto; 
}
.device-card, .el-tag {
  transition: box-shadow 0.2s, border-color 0.2s, background 0.2s;
}
.device-header {
  display: flex;
  justify-content: space-between;
  color: #eee;
  font-weight: 600;
}
.error-tag {
  font-size: 12px;
  color: #ccc;
  display: flex;
  gap: 4px;    
  align-items: center;
  margin: 0;
}
.device-status {
  display: flex;
  justify-content: space-around;
  margin-top: 12px;
}
.status-item {
  text-align: center;
}
.status-label {
  font-size: 14px;
  color: #bbb;
  margin-bottom: 4px;
}
.el-switch {
  --el-switch-on-color: #52c41a;
  --el-switch-off-color: #ff4d4f;
}
.agv-status, .alarm-status {
  margin-top: 12px;
  font-size: 13px;
}
.device-card:hover {
  background-color: #3a3a3a;
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
  border-color: #409eff; 
  box-shadow: 0 0 12px 0 #0d81f5b0;
}
.device-card::-webkit-scrollbar {
  width: 2px;           /* 幾乎不佔空間 */
  background: transparent;
}
.device-card::-webkit-scrollbar-thumb {
  background: transparent; /* 完全透明 */
}
.device-card {
  scrollbar-width: thin;      /* Firefox: 極細 */
  scrollbar-color: transparent transparent; /* Firefox: 透明 */
}
.status-desc {
  font-size: 12px;
  font-weight: 500;
  /* 根據 switch 狀態顏色，預設為灰色 */
  color: #bbb;
}
.device-card.has-alarm {
  border-color: #ff4d4f !important;
  box-shadow: 0 0 12px 0 #ff1d21b9;
}
.device-card.not-alive:not(.has-alarm) {
  border-color: #fdc84ca4 !important; /* 亮橘色 */
  box-shadow: 0 0 16px 0 #ffcb5283;
}
.agv-status {
  margin-top: 12px;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.agv-card {
  background: #444950ce;         /* 更柔和的深灰色 */
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
  color: #eee;
  box-shadow: 0 1px 4px #0002;
  border: 1px solid #444;
  min-width: 220px;
}
.agv-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.agv-status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
  border: 2px solid #222;
}
.agv-status-dot.online {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a99;
}
.agv-status-dot.offline {
  background: #ff4d4f;
  box-shadow: 0 0 6px #ff4d4f99;
}
.agv-name {
  font-weight: bold;
  font-size: 15px;
  letter-spacing: 1px;
}
.agv-state-text {
  margin-left: auto;
  font-size: 13px;
  color: #90caf9;
}
.agv-battery-row {
  display: flex;
  align-items: center;
  gap: 8px;         /* 讓進度條和數字有間距 */
  margin-top: 4px;
}
.battery-text {
  font-size: 12px;
  color: #fff200;
  font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
  letter-spacing: 1px;
  vertical-align: middle;
}
/* 綠色（高電量） */
.battery-text.green {
  color: #81c784;
}
/* 黃色（中電量） */
.battery-text.yellow {
  color: #ffe066;
}
/* 紅色（低電量） */
.battery-text.red {
  color: #e57373;
}

.alarm-area {
  background: rgba(255, 77, 79, 0.12);
  border-left: 4px solid #ff4d4f;
  padding: 8px 12px;
  margin-top: 18px;
  border-radius: 8px;
  color: #ff4d4f;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.alarm-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.alarm-list li {
  margin-bottom: 2px;
}
.alarm-time {
  font-size: 12px;
  color: #ffbaba;
  margin-right: 6px;
}
.alarm-desc {
  font-size: 13px;
}
</style>
