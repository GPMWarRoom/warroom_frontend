<template>
    <div class="card">
        <h3 class="flex-header">
            <div class="title-group">
                <span>即時狀態</span>
                <el-tag :type="connectTagType" size="small">{{ connectText }}</el-tag>
                <el-tag :type="station?.IsUsing ? 'warning' : 'info'" size="small">
                    {{ station?.IsUsing ? '使用中' : '未使用' }}
                </el-tag>
            </div>
            <div class="title-group">
                <span class="window-label">顯示區間</span>
                <el-select v-model="windowSec" size="small" style="width: 110px;" :teleported="true">
                    <el-option :label="'1 分鐘'" :value="60" />
                    <el-option :label="'5 分鐘'" :value="300" />
                    <el-option :label="'10 分鐘'" :value="600" />
                </el-select>
            </div>
        </h3>

        <div class="content">
            <template v-if="station">
                <!-- 文字狀態 -->
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">使用中的車輛</span>
                        <span class="value">{{ station.UseVehicleName || '-' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">運行狀態</span>
                        <span class="value">
                            <el-tag :type="statusTagType" size="small">{{ station.StatusText || 'UNKNOWN' }}</el-tag>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">充電模式</span>
                        <span class="value">{{ station.ChargeModeText || 'UNKNOWN' }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">站體溫度超過門檻</span>
                        <span class="value">
                            <el-tag :type="station.IsStationTemperatureOverThresHold ? 'danger' : 'success'" size="small">
                                {{ station.IsStationTemperatureOverThresHold ? '是' : '否' }}
                            </el-tag>
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">錯誤碼</span>
                        <span class="value" :class="{ warning: !!station.ErrorCodes }">
                            {{ station.ErrorCodes || '無' }}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="label">狀態更新時間</span>
                        <span class="value">{{ updateTimeText }}</span>
                    </div>
                </div>

                <!-- 數值：每個指標一張即時曲線（X 為時間、Y 為數值） -->
                <div class="live-grid">
                    <LiveValueChart
                        v-for="m in METRICS"
                        :key="m.key"
                        :title="m.title"
                        :unit="m.unit"
                        :color="m.color"
                        :decimals="m.decimals"
                        :window-ms="windowSec * 1000"
                        :warning="m.key === 'stationTemperature' && !!station.IsStationTemperatureOverThresHold"
                        :samples="seriesOf(m.key)"
                    />
                </div>
            </template>
            <el-empty v-else description="無充電站即時資料" class="w-100" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import LiveValueChart from './LiveValueChart.vue'

const props = defineProps<{
    /** 目前選到的充電站即時資料（由 SignalR 推播而來） */
    station: any | null
    /** 由父層累積的取樣序列：[{ t, voltageIn, voltageOut, ... }] */
    samples: any[]
}>()

const windowSec = ref(60)

/** 電壓／電流／溫度：每個數值各一張即時曲線 */
const METRICS = [
    { key: 'voltageIn', title: '輸入電壓 Vin', unit: 'V', color: '#20A0FF', decimals: 2 },
    { key: 'voltageOut', title: '輸出電壓 Vout', unit: 'V', color: '#7EC8FF', decimals: 2 },
    { key: 'current', title: '輸出電流 Iout', unit: 'A', color: '#FF9F40', decimals: 2 },
    { key: 'cc', title: '定電流設定／讀值 CC', unit: 'A', color: '#FFC07A', decimals: 2 },
    { key: 'cv', title: '定電壓設定／讀值 CV', unit: 'V', color: '#5AD8A6', decimals: 2 },
    { key: 'fv', title: '浮充設定／讀值 FV', unit: 'V', color: '#9EE7C8', decimals: 2 },
    { key: 'tc', title: '溫度補償相關讀值 TC', unit: '', color: '#F5D76E', decimals: 2 },
    { key: 'chargerTemperature', title: '充電器溫度', unit: '°C', color: '#FF6384', decimals: 1 },
    { key: 'stationTemperature', title: '站體溫度', unit: '°C', color: '#FF9BB0', decimals: 1 }
]

/** 把父層的取樣列拆成單一指標的 [{ t, v }] */
function seriesOf(key: string) {
    return (props.samples || []).map((s: any) => ({ t: s.t, v: s[key] ?? null }))
}

const connectText = computed(() =>
    props.station?.ConnectText || (props.station?.Connected ? 'Connect' : 'Disconnect')
)
const connectTagType = computed(() => (props.station?.Connected ? 'success' : 'danger'))

const statusTagType = computed(() => {
    switch (props.station?.Status) {
        case 1: return 'success'
        case 2: return 'danger'
        case 3: return 'warning'
        default: return 'info'
    }
})

const updateTimeText = computed(() => {
    const t = props.station?.UpdateTime
    return t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-'
})
</script>

<style scoped lang="scss">
.card {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    h3 {
        margin: 0;
        padding: 8px 16px;
        background: #23272f;
        color: #fff;
        font-size: 1.1rem;
        border-bottom: 1px solid #333;
        flex-shrink: 0;
    }

    .flex-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        position: relative;
        z-index: 5;
    }

    .title-group {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .window-label {
        color: #aaa;
        font-size: 12px;
    }

    .content {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 16px 14px;
        overflow-y: auto;
    }
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 8px 16px;
    flex-shrink: 0;
}

.detail-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 10px;
    background: #141414;
    border: 1px solid #2c2c2c;
    border-radius: 6px;

    .label {
        color: #aaa;
        font-size: 12px;
        white-space: nowrap;
    }

    .value {
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        text-align: right;
        word-break: break-all;

        &.warning {
            color: #ff4757;
        }
    }
}

.live-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(140px, 1fr);
    gap: 8px;
}

.w-100 { width: 100%; }

@media (max-width: 1200px) {
    .live-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
