<template>
    <div class="log-download">
        <el-card class="panel" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>撈取 LOG — {{ schemaLabel }}</span>
                </div>
            </template>

            <el-form label-position="top" class="log-form">
                <div class="field-grid">
                    <el-form-item label="場域" class="span-2">
                        <el-select v-model="schema" placeholder="選擇場域" style="width: 100%">
                            <el-option v-for="item in realTimeData.agvcList" :key="item.value" :label="item.name" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="LOG 種類">
                        <el-select v-model="selectedKind" style="width: 100%">
                            <el-option v-for="t in logKinds" :key="t.key" :label="t.name" :value="t.key" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="日期">
                        <el-date-picker v-model="selectedDate" type="date" value-format="YYYY-MM-DD"
                            :clearable="false" placeholder="選擇日期" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="派車系統 IP（必填）" class="span-2">
                        <div class="ip-row">
                            <el-input v-model="ipInput" :disabled="ipLocked" placeholder="例如 10.22.141.10"
                                @keyup.enter="saveIp()" />
                            <el-button v-if="ipLocked" :icon="Unlock" @click="unlockIp">解鎖</el-button>
                            <template v-else>
                                <el-button type="primary" :icon="Check" @click="saveIp()">儲存</el-button>
                                <el-button v-if="hasIpOverride" :icon="RefreshLeft" @click="resetIp">還原</el-button>
                            </template>
                        </div>
                        <span class="hint" :class="{ 'is-error': !apiBase }">{{ ipHint }}</span>
                    </el-form-item>
                    <el-form-item label="AGV" class="span-2">
                        <el-select v-if="agvOptions.length" v-model="selectedAgv" filterable allow-create
                            default-first-option :disabled="!currentKind.needAgvName"
                            :placeholder="currentKind.needAgvName ? '選擇或輸入車號' : '僅車載／車控需要'"
                            style="width: 100%" :loading="agvLoading">
                            <el-option v-for="a in agvOptions" :key="a" :label="a" :value="a" />
                        </el-select>
                        <el-input v-else v-model="selectedAgv" :disabled="!currentKind.needAgvName"
                            :placeholder="currentKind.needAgvName ? 'AGV_001' : '僅車載／車控需要'"
                            style="width: 100%" />
                        <span class="hint">{{ currentKind.needAgvName ? agvHint : '此 LOG 種類不需選擇 AGV' }}</span>
                    </el-form-item>
                    <el-form-item label="包含參數檔" class="span-2">
                        <div class="check-line">
                            <el-checkbox v-model="includeConfig" :disabled="!currentKind.supportIncludeConfig">
                                一併打包系統參數
                            </el-checkbox>
                        </div>
                        <span class="hint" v-if="!currentKind.supportIncludeConfig">此類型無參數檔可打包</span>
                    </el-form-item>
                </div>

                <div class="source-hint">
                    <div>來源：{{ currentKind.source }}</div>
                    <div :class="{ 'is-error': !apiBase }">
                        送往 tools：{{ apiBase || '尚未填入派車系統 IP' }}
                    </div>
                </div>

                <div class="actions">
                    <el-button type="primary" :icon="Download" :loading="downloading" @click="handleDownload">
                        撈取並下載
                    </el-button>
                    <span class="status" :class="{ 'is-error': isError }" v-if="statusText">{{ statusText }}</span>
                </div>

                <el-alert v-if="downloading" class="tip" type="info" :closable="false" show-icon
                    title="API 會等整包撈完才回報成功或失敗，車載 LOG 可能需要數分鐘。期間請勿關閉或重新整理此頁面。" />
            </el-form>
        </el-card>

        <el-card class="panel" shadow="never" v-if="lastResult">
            <template #header>
                <div class="card-header">
                    <span>完成後的檔案位置</span>
                </div>
            </template>
            <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="檔名">{{ lastResult.fileName }}</el-descriptions-item>
                <el-descriptions-item label="大小">{{ toMb(lastResult.sizeBytes) }} MB</el-descriptions-item>
                <el-descriptions-item label="撈取耗時" v-if="lastResult.elapsedMs">
                    {{ toClock(Math.round(lastResult.elapsedMs / 1000)) }}
                </el-descriptions-item>
                <el-descriptions-item label="派車主機路徑">
                    <span class="file-path">{{ lastResult.filePath || '（API 未回傳路徑）' }}</span>
                    <el-button v-if="lastResult.filePath" link type="primary" :icon="CopyDocument"
                        @click="copyPath">複製</el-button>
                </el-descriptions-item>
                <el-descriptions-item label="瀏覽器">已下載到瀏覽器的下載資料夾</el-descriptions-item>
                <el-descriptions-item label="備註" v-if="lastResult.message">{{ lastResult.message }}</el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, CopyDocument, Unlock, Check, RefreshLeft } from '@element-plus/icons-vue'
import { realTimeStore } from '@/stores/realTime'
import {
    LOG_KINDS, DEFAULT_AGV_NAME, getAgvOptions, getLogApiBase, getLogApiEndpointInfo,
    getIpOverride, setIpOverride, normalizeApiBase, displayHost, clearLogApiBaseCache,
    downloadLog, pickLogApiError
} from '@api/logTools'
import type { LogKindKey, LogKindInfo, CollectParams, DownloadResult, AgvOptionSource } from '@api/logTools'
import { getAgvNames } from '@/api/agvc'

const realTimeData = realTimeStore()

const logKinds = LOG_KINDS
const selectedKind = ref<LogKindKey>('agvs')
const selectedDate = ref<string>(today())
const agvOptions = ref<string[]>([])
const agvSource = ref<AgvOptionSource>('fixed')
const agvLoading = ref(false)
const selectedAgv = ref<string>('')
const includeConfig = ref(true)

const transferText = ref('')
const ipInput = ref('')
const ipLocked = ref(false)
const hasIpOverride = ref(false)
const serverIp = ref('')
const serverPort = ref(5051)
const downloading = ref(false)
const elapsedSec = ref(0)
let elapsedTimer: number | null = null
const statusText = ref('')
const isError = ref(false)
const lastResult = ref<DownloadResult | null>(null)

/** 場域在表單內用下拉選單選擇（選項與場域資訊相同），選擇結果交由「管理與設定」頁保存 */
const schema = defineModel<string>('schema', { required: true })
const schemaLabel = computed(() => schema.value || '未選擇場域')

const currentKind = computed<LogKindInfo>(
    () => logKinds.find(t => t.key === selectedKind.value) ?? logKinds[0]
)

function today(): string {
    const d = new Date()
    const m = `${d.getMonth() + 1}`.padStart(2, '0')
    const day = `${d.getDate()}`.padStart(2, '0')
    return `${d.getFullYear()}-${m}-${day}`
}

function toMb(bytes: number): string {
    return (bytes / 1048576).toFixed(1)
}

/** 秒數轉 mm:ss */
function toClock(sec: number): string {
    const m = Math.floor(sec / 60)
    const s2 = sec % 60
    return `${m}:${`${s2}`.padStart(2, '0')}`
}

function startElapsed() {
    elapsedSec.value = 0
    stopElapsed()
    elapsedTimer = window.setInterval(() => {
        elapsedSec.value += 1
        if (!transferText.value) statusText.value = `撈取中…已等待 ${toClock(elapsedSec.value)}（撈完才會回報結果）`
    }, 1000)
}

function stopElapsed() {
    if (elapsedTimer !== null) {
        window.clearInterval(elapsedTimer)
        elapsedTimer = null
    }
}

/** 該場域目前的車輛名稱（即時監控推播來的），用來決定有幾台車；推播資料屬於場域資訊選的場域，不同場域時不採用 */
const realtimeAgvNames = computed<string[]>(() => {
    if (schema.value !== realTimeData.selectedAgvc) return []
    const eqStatus = realTimeData.AGVC_RealTimeDashboard_EQStatus_AGV || []
    const agvStates = (realTimeData as any).AGVC_RealTimeDashboard_AgvStates || []
    const names = [...eqStatus, ...agvStates]
        .map((e: any) => e?.Name || e?.name || e?.AGV_Name)
        .filter(Boolean)
        .map(String)
    return Array.from(new Set(names))
})

const AGV_SOURCE_TEXT: Record<AgvOptionSource, string> = {
    db: '場域資料庫',
    config: 'config.json 設定',
    realtime: '即時監控資料',
    fixed: '固定格式 AGV_00n'
}

const agvHint = computed(() => {
    if (agvLoading.value) return '車號載入中…'
    if (agvSource.value === 'fixed' || !agvOptions.value.length) {
        return '此場域無車號清單，預設 AGV_001（可自行修改，tools 會依場域對應車號 IP）'
    }
    return `${agvOptions.value.length} 台（${AGV_SOURCE_TEXT[agvSource.value]}）`
})

/** 場域資料庫的車號（AgvStates.AGV_Name） */
async function fetchDbAgvNames(): Promise<string[]> {
    if (!schema.value) return []
    try {
        const res: any = await getAgvNames(schema.value)
        const list = res?.agvList || res?.AgvList || res?.data?.agvList || res?.data?.AgvList || []
        return Array.isArray(list) ? list.map((x: any) => String(x)).filter(Boolean) : []
    } catch (err) {
        console.error('取得場域 AGV 車號失敗', err)
        return []
    }
}

/**
 * 送往的 tools 位址：一律以畫面上的「派車系統 IP」為準。
 * 六種 LOG（含車載／車控）都是由該區域派車主機上的 tools 撈取，所以每一種都要有這個 IP；
 * 只要 dashboard 連得到該區域網路就能下指令，不需要資料庫有上報紀錄。
 */
const apiBase = computed(() => normalizeApiBase(ipInput.value, serverPort.value))

const ipHint = computed(() => {
    if (!ipInput.value.trim()) return '必填：所有 LOG 都由該區域派車主機上的 tools 撈取。資料庫沒有此場域的 IP，請直接填入'
    if (!apiBase.value) return 'IP 格式不正確，例如 10.22.141.10 或 10.22.141.10:5051'
    if (!ipLocked.value) return '填完按儲存（或直接按撈取，會一併記住）'
    if (hasIpOverride.value) return `手動指定（資料庫記錄為 ${serverIp.value || '無'}）`
    return '取自派車系統資料庫（與派車地圖同一台主機），要改請按解鎖'
})

/**
 * 帶入派車系統 IP，順序：手動填過的 → config.json → 資料庫（與派車地圖同一台）→ config default。
 * 都沒有就留空讓使用者自己填，不影響撈取。
 */
async function loadApiBase() {
    if (!schema.value) {
        ipInput.value = ''
        ipLocked.value = false
        hasIpOverride.value = false
        return
    }

    const info = await getLogApiEndpointInfo(schema.value)
    serverIp.value = info.ip
    serverPort.value = info.port || 5051

    const override = getIpOverride(schema.value)
    hasIpOverride.value = !!override
    ipInput.value = override || displayHost(await getLogApiBase(schema.value), serverPort.value)
    ipLocked.value = !!ipInput.value        // 有值先鎖住，要改請按解鎖；空的可直接填
}

function unlockIp() {
    ipLocked.value = false
}

/**
 * 記住畫面上的派車系統 IP（每個場域一筆，存在瀏覽器）。
 * 跟資料庫記錄相同就不另外存，之後資料庫 IP 變了會自動跟著變。
 * @returns 是否儲存成功
 */
function saveIp(silent = false): boolean {
    const value = ipInput.value.trim()
    if (!value) {
        ElMessage.warning('請填入派車系統 IP')
        return false
    }
    if (!apiBase.value) {
        ElMessage.warning('IP 格式不正確，例如 10.22.141.10 或 10.22.141.10:5051')
        return false
    }

    const sameAsDb = !!serverIp.value && value === serverIp.value
    setIpOverride(schema.value, sameAsDb ? '' : value)
    clearLogApiBaseCache(schema.value)
    hasIpOverride.value = !sameAsDb
    ipLocked.value = true
    if (!silent) ElMessage.success(`已設定派車系統 IP：${apiBase.value}`)
    return true
}

/** 清掉手動指定，改回資料庫偵測到的 IP */
async function resetIp() {
    setIpOverride(schema.value, '')
    clearLogApiBaseCache(schema.value)
    await loadApiBase()
    ElMessage.success('已還原為自動偵測的 IP')
}

async function loadAgvOptions() {
    agvLoading.value = true
    try {
        const dbNames = await fetchDbAgvNames()
        const result = await getAgvOptions(schema.value, {
            dbNames,
            realtimeNames: realtimeAgvNames.value
        })
        agvOptions.value = result.options
        agvSource.value = result.source

        if (!agvOptions.value.length) {
            // 沒有車號清單 → 固定預設 AGV_001
            selectedAgv.value = DEFAULT_AGV_NAME
        } else if (!agvOptions.value.includes(selectedAgv.value)) {
            selectedAgv.value = agvOptions.value[0]
        }
    } finally {
        agvLoading.value = false
    }
}

async function handleDownload() {
    const kind = currentKind.value
    if (!schema.value) {
        ElMessage.warning('請先選擇場域')
        return
    }
    // 所有種類都要送到該區域的 tools：派車系統 IP 必填
    if (!ipInput.value.trim()) {
        ElMessage.warning('請先填入派車系統 IP（所有 LOG 都由該區域派車主機上的 tools 撈取）')
        return
    }
    if (!apiBase.value) {
        ElMessage.warning('派車系統 IP 格式不正確，例如 10.22.141.10 或 10.22.141.10:5051')
        return
    }
    // 解鎖後改了 IP 但還沒按儲存：直接採用並記住
    if (!ipLocked.value && !saveIp(true)) return
    if (kind.needAgvName && !selectedAgv.value) {
        ElMessage.warning('請先選擇或輸入 AGV 車號')
        return
    }
    if (!selectedDate.value) {
        ElMessage.warning('請先選擇日期')
        return
    }

    const params: CollectParams = {
        date: selectedDate.value,
        includeConfig: kind.supportIncludeConfig ? includeConfig.value : false
    }
    if (kind.needAgvName) params.agvName = selectedAgv.value

    downloading.value = true
    isError.value = false
    transferText.value = ''
    statusText.value = '撈取中…（撈完才會回報結果）'
    lastResult.value = null
    startElapsed()

    try {
        const result = await downloadLog(apiBase.value, schema.value, kind.key, params, (loaded, total) => {
            // 有資料進來＝API 撈完開始回傳檔案了
            transferText.value = total > 0
                ? `接收檔案 ${Math.floor((loaded / total) * 100)}%（${toMb(loaded)} / ${toMb(total)} MB）`
                : `接收檔案 ${toMb(loaded)} MB`
            statusText.value = transferText.value
        })

        const spent = result.elapsedMs > 0 ? toClock(Math.round(result.elapsedMs / 1000)) : toClock(elapsedSec.value)
        lastResult.value = result
        statusText.value = `撈取成功：${result.fileName}（耗時 ${spent}）`
        ElMessage.success(`撈取成功：${result.fileName}（耗時 ${spent}）`)
    } catch (err) {
        isError.value = true
        const reason = await pickLogApiError(err)
        statusText.value = `撈取失敗（等待 ${toClock(elapsedSec.value)}）：${reason}`
        ElMessage.error(reason)
    } finally {
        stopElapsed()
        transferText.value = ''
        downloading.value = false
    }
}

async function copyPath() {
    const path = lastResult.value?.filePath
    if (!path) return
    try {
        await navigator.clipboard.writeText(path)
        ElMessage.success('已複製檔案路徑')
    } catch {
        ElMessage.warning('瀏覽器不允許複製，請手動選取')
    }
}

watch(schema, () => {
    statusText.value = ''
    isError.value = false
    lastResult.value = null
    loadApiBase()
    loadAgvOptions()
})

// 即時車輛資料晚到時（例如先進 LOG 撈取分頁），車號選單跟著補上
watch(realtimeAgvNames, () => loadAgvOptions())

onMounted(async () => {
    await loadApiBase()
    await loadAgvOptions()
})

onUnmounted(stopElapsed)
</script>

<style scoped>
.log-download {
    height: 100%;
    width: 100%;
    padding: 12px;
    overflow-y: auto;
}

.panel {
    margin-bottom: 16px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.log-form :deep(.el-form-item) {
    margin-bottom: 8px;
}

.log-form :deep(.el-form-item__content) {
    align-items: flex-start;
    flex-direction: column;
}

.field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    align-items: start;
}

.span-2 {
    grid-column: span 2;
}

.check-line {
    min-height: 32px;
    display: flex;
    align-items: center;
}

.ip-row {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
}

.ip-row .el-input {
    flex: 1;
}

.hint {
    display: block;
    width: 100%;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    opacity: 0.7;
}

@media (max-width: 900px) {
    .field-grid {
        grid-template-columns: 1fr;
    }

    .span-2 {
        grid-column: auto;
    }
}

.source-hint {
    font-size: 12px;
    opacity: 0.7;
    margin: 4px 0 12px 0;
    word-break: break-all;
}

.source-hint .is-error,
.hint.is-error {
    color: var(--el-color-danger);
    opacity: 1;
}

.actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.status {
    font-size: 13px;
}

.status.is-error {
    color: var(--el-color-danger);
}

.tip {
    margin-top: 12px;
}

.file-path {
    word-break: break-all;
    margin-right: 8px;
}
</style>
