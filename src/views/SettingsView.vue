<template>
    <content-container>
        <div class="h-100">
            <div class="settings-tabbar">
                <span class="settings-tab is-active">
                    <el-icon><Download /></el-icon>
                    <span>LOG撈取</span>
                </span>
            </div>
            <div class="settings-content">
                <LogDownloadPanel v-model:schema="logField" />
            </div>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import { Download } from '@element-plus/icons-vue'
import ContentContainer from '../components/ContentContainer.vue'
import LogDownloadPanel from '../components/AGVC/LogDownload/index.vue'
import { realTimeStore } from '../stores/realTime'
import { useSignalR } from '@/composables/useSignalR'
import { useSessionRef } from '@/composables/useSessionState'

const realTimeData = realTimeStore()
const { on, off, connection, isConnected } = useSignalR()

// LOG 撈取的場域與場域資訊分開：預設帶入場域資訊目前的場域，之後各自切換互不影響
const logField = useSessionRef<string>('log-field', realTimeData.selectedAgvc, v => typeof v === 'string' && v !== '')

/** 選到的場域不在清單內時，改用場域資訊的場域，再不行就用清單第一個 */
function ensureFieldInList() {
    const list = realTimeData.agvcList
    if (!list.length || list.some(item => item.value === logField.value)) return
    logField.value = list.some(item => item.value === realTimeData.selectedAgvc)
        ? realTimeData.selectedAgvc
        : list[0].value
}

function handleReceiveChannels(schemas: any) {
    if (!schemas || schemas.length === 0) return
    realTimeData.setAgvcList(schemas)
}

watch(() => realTimeData.agvcList, ensureFieldInList, { immediate: true })

onMounted(async () => {
    // 場域資訊頁已取得場域清單就直接共用；重複向後端要會讓場域資訊重新初始化
    if (realTimeData.agvcList.length) return
    on('ReceiveChannels', handleReceiveChannels)
    try {
        if (isConnected.value) {
            await connection.value?.invoke('GetChannels')
        }
    } catch (err) {
        console.error('❌ 取得場域清單失敗：', err)
    }
})

onUnmounted(() => {
    off('ReceiveChannels', handleReceiveChannels)
})
</script>
<style scoped>
/* 版面比照場域資訊：上方頁籤，下方內容填滿剩餘空間 */
.h-100 {
    display: flex;
    flex-direction: column;
    min-height: 0;
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 4px;
}

.settings-tabbar {
    display: flex;
    flex: none;
    align-items: center;
    gap: 6px;
    padding: 0 10px;
    min-height: 36px;
}

.settings-tab {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    color: var(--text-color);
    border: 1px solid var(--tab-border-color);
    border-radius: var(--radius-pill);
    font-size: 14px;
    line-height: 32px;
    white-space: nowrap;
}

.settings-tab .el-icon {
    margin-right: 4px;
}

.settings-tab.is-active {
    background: var(--accent-gradient);
    border-color: transparent;
    color: #fff;
    box-shadow: var(--accent-glow);
}

.settings-content {
    flex: 1;
    min-height: 0;
    margin-top: 6px;
    padding: 0 10px;
}
</style>
