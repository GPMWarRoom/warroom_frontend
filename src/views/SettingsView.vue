<template>
    <content-container>
        <div class="h-100">
            <div class="settings-tabbar">
                <button v-for="tab in TABS" :key="tab.name" type="button" class="settings-tab"
                    :class="{ 'is-active': activeTab === tab.name }" @click="activeTab = tab.name">
                    <el-icon><component :is="tab.icon" /></el-icon>
                    <span>{{ tab.label }}</span>
                </button>
            </div>
            <div class="settings-content">
                <!-- 用 v-show：LOG 撈取可能還在等 API 回應，切換頁籤時不能卸載 -->
                <LogDownloadPanel v-show="activeTab === 'log'" v-model:schema="logField" />
                <DatabaseManager v-show="activeTab === 'database'" :active="pageActive && activeTab === 'database'" />
            </div>
        </div>
    </content-container>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, onActivated, onDeactivated, watch } from 'vue'
import { Download, Coin } from '@element-plus/icons-vue'
import ContentContainer from '../components/ContentContainer.vue'
import LogDownloadPanel from '../components/AGVC/LogDownload/index.vue'
import DatabaseManager from '../components/DatabaseManager/index.vue'
import { realTimeStore } from '../stores/realTime'
import { useSignalR } from '@/composables/useSignalR'
import { useSessionRef, isOneOf } from '@/composables/useSessionState'

const realTimeData = realTimeStore()
const { on, off, connection, isConnected } = useSignalR()

const TABS = [
    { name: 'log', label: 'LOG撈取', icon: Download },
    { name: 'database', label: '資料庫管理', icon: Coin },
] as const
// 自動重新整理後回到原本的頁籤
const activeTab = useSessionRef<string>('settings-tab', 'log', isOneOf(TABS.map(t => t.name)))

// 頁面被 keep-alive 快取：離開再回來時資料庫管理要重新向後端取一次
const pageActive = ref(true)
onActivated(() => { pageActive.value = true })
onDeactivated(() => { pageActive.value = false })

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
    background: transparent;
    border: 1px solid var(--tab-border-color);
    border-radius: var(--radius-pill);
    cursor: pointer;
    font-size: 14px;
    line-height: 32px;
    white-space: nowrap;
    transition: color 0.2s, box-shadow 0.2s;
}

.settings-tab .el-icon {
    margin-right: 4px;
}

.settings-tab:hover {
    color: var(--accent-color);
}

.settings-tab.is-active,
.settings-tab.is-active:hover {
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
