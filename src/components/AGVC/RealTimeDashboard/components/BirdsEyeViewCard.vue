<template>
    <div class="traffic-stats-dashboard">
        <el-card class="bird-view-card-wrapper">
            <template #header>
                <div class="d-flex justify-content-between align-items-center">
                    <span>Bird's Eye View</span>
                </div>
            </template>
            
            <div class="map-body">
                <BirdViewMap 
                    class="h-100 w-100" 
                    v-if="showMap"
                    mapId="map3" 
                    :map-model="mapModelWithVehicles"
                    :key="mapModelKey" 
                />
                <div v-else class="loading-placeholder">
                    載入地圖中...
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import BirdViewMap from '../../maps/BirdViewMap.vue'
import { realTimeStore } from '@/stores/realTime'
import { ref, watch, computed } from 'vue'
import agvImg from '@/AGV.png'

const realTimeData = realTimeStore()
const mapModelKey = ref(Date.now())

const getAgvColor = (status: any) => {
    if (status == null || status === '') return '#909399'; 

    if (typeof status === 'object') {
        // 優先抓取後端已經轉換好的 StatusText
        status = status.StatusText ?? status.statusText ?? status.Status ?? status.status ?? status.State ?? status.state ?? status.Name ?? status.name ?? status.Value ?? status.value ?? JSON.stringify(status);
    }

    const s = String(status).toUpperCase();

    // 🚨 修正核心：完全對齊後端 EQService.cs 的數字定義 🚨
    if (s === '0') return '#E6A23C'; // 0 => idle (黃色待命)
    if (s === '1') return '#67C23A'; // 1 => run (綠色運行)
    if (s === '2') return '#F56C6C'; // 2 => down (紅色異常)
    if (s === '3') return '#409EFF'; // 3 => charging (藍色充電)

    // 備用防呆：字串比對
    if (['DOWN', 'ALARM', 'ERROR', 'FAULT', 'WARN'].some(k => s.includes(k))) return '#F56C6C'; 
    if (['IDLE', 'STANDBY', 'WAIT', 'READY', 'IDLING', 'STOP'].some(k => s.includes(k))) return '#E6A23C';
    if (['RUN', 'EXECUT', 'MOVE', 'AUTO', 'WORKING', 'BUSY'].some(k => s.includes(k))) return '#67C23A';
    if (['CHARG', 'BATTERY'].some(k => s.includes(k))) return '#409EFF';
    if (['OFFLINE', 'DISCONNECT'].some(k => s.includes(k))) return '#909399';

    return '#909399'; // 預設灰色
};

const getAgvStateNumber = (status: any) => {
    if (status == null || status === '') return 0;
    
    if (typeof status === 'object') {
        status = status.StatusText ?? status.statusText ?? status.Status ?? status.status ?? status.State ?? status.state ?? status.Name ?? status.name ?? status.Value ?? status.value ?? JSON.stringify(status);
    }

    const s = String(status).toUpperCase();
    
    // 對齊後端數字
    if (s === '0') return 0; // idle
    if (s === '1') return 1; // run
    if (s === '2') return 2; // down
    if (s === '3') return 3; // charging

    if (['DOWN', 'ALARM', 'ERROR', 'FAULT', 'WARN'].some(k => s.includes(k))) return 2;
    if (['IDLE', 'STANDBY', 'WAIT', 'READY', 'IDLING', 'STOP'].some(k => s.includes(k))) return 0;
    if (['RUN', 'EXECUT', 'MOVE', 'AUTO', 'WORKING', 'BUSY'].some(k => s.includes(k))) return 1;
    if (['CHARG', 'BATTERY'].some(k => s.includes(k))) return 3;
    return 0; 
};

const mapModelWithVehicles = computed(() => {
    const mapModel = realTimeData.AGVC_TrafficStats_mapModel;
    const points = mapModel?.Map?.Points || {};
    
    const agvList = realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV || [];
    const agvStates = (realTimeData as any).AGVC_RealTimeDashboard_AgvStates || [];

    return {
        ...mapModel,
        Vehicles: agvList.map((item: any) => {
            const itemName = String(item.Name || item.AGV_ID || item.AGVID || '').trim().toLowerCase();
            const stateItem = agvStates.find((s: any) => {
                const sName = String(s.AGV_Name || s.agV_Name || s.agv_Name || s.AGV_ID || s.AGVID || s.Name || '').trim().toLowerCase();
                return sName === itemName && sName !== '';
            }) || {};

            // 1. 座標解析
            let exactX = item.CoordinateX ?? item.coordinateX ?? stateItem.CoordinateX ?? stateItem.coordinateX;
            let exactY = item.CoordinateY ?? item.coordinateY ?? stateItem.CoordinateY ?? stateItem.coordinateY;
            let theta = item.Theta ?? item.theta ?? stateItem.Theta ?? stateItem.theta ?? 0;

            let x = exactX !== undefined ? exactX : 0;
            let y = exactY !== undefined ? exactY : 0;

            if (exactX === undefined && exactY === undefined) {
                const currentTag = stateItem.CurrentLocation || stateItem.currentLocation || item.CurrentNode || item.CurrentTag || item.Tag;
                if (currentTag) {
                    const pointInfo = Object.values(points).find((p: any) => 
                        String(p.TagNumber) === String(currentTag) || 
                        String(p.Name) === String(currentTag)
                    );
                    if (pointInfo) {
                        x = pointInfo.X !== undefined ? pointInfo.X : x;
                        y = pointInfo.Y !== undefined ? pointInfo.Y : y;
                    }
                }
            }

            // 2. 終極狀態解析池：窮舉所有可能的後端欄位命名
            const possibleStatusFields = [
                'StatusText', 'statusText', 
                'Main_Status', 'main_status', 'MainStatus', 'mainStatus', 
                'AGV_State', 'AGVState', 'VehicleState', 'ActionState', 
                'State', 'state', 'Status', 'status', 'StatusCode', 'OnlineStatus', 'Mode'
            ];

            let currentStatus: any = undefined;

            // 優先找 AgvStates (通常包含即時業務邏輯)，再找 EQStatus_AGV (通常只有連線狀態)
            for (const field of possibleStatusFields) {
                if (stateItem[field] !== undefined && stateItem[field] !== null && stateItem[field] !== '') {
                    currentStatus = stateItem[field];
                    break;
                }
            }
            if (currentStatus === undefined) {
                for (const field of possibleStatusFields) {
                    if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
                        currentStatus = item[field];
                        break;
                    }
                }
            }

            const finalColor = getAgvColor(currentStatus);
            const stateNumber = getAgvStateNumber(currentStatus);
            
            // 重要：這行可以讓你在 F12 Console 清楚看到抓到了什麼值
            console.log(`[AGV: ${item.Name || item.AGV_ID || 'Unknown'}] 提取到原始狀態值:`, currentStatus, `判定顏色: ${finalColor}`);

            return {
                id: item.Name || 'AGV',
                x: x,
                y: y,
                img: agvImg,      
                image: agvImg,    
                theta: theta,     
                status: stateNumber,
                Status: stateNumber,
                state: stateNumber,
                State: stateNumber,
                color: finalColor, 
                Color: finalColor,
                width: 50,        
                height: 50        
            }
        })
    }
})

const showMap = ref(false)
watch(
    () => realTimeData.AGVC_TrafficStats_mapModel,
    (val) => {
        if (val && val.Map) {
            showMap.value = false
            setTimeout(() => { 
                showMap.value = true 
            }, 50)
        }
    },
    { deep: true, immediate: true }
)
</script>

<style scoped lang="scss">
.traffic-stats-dashboard {
    width: 100%;
    height: auto;
    .bird-view-card-wrapper {
        height: 365px; 
        display: flex;
        flex-direction: column;
        :deep(.el-card__body) {
            flex: 1;
            padding: 0; 
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
    }
    .map-body {
        flex: 1;
        width: 100%;
        height: 100%;
        position: relative;
    }
    .loading-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
    }
}
</style>