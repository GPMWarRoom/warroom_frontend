<template>
    <div class="db-manager">
        <el-card class="panel" shadow="never">
            <template #header>
                <div class="card-header">
                    <div class="title">
                        <span>資料庫管理</span>
                        <span class="sub" v-if="overview">
                            PostgreSQL {{ overview.ServerVersion }} · 本系統資料庫：{{ overview.SystemDatabase }}
                        </span>
                    </div>
                    <div class="toolbar">
                        <el-input v-model="keyword" clearable :prefix-icon="Search"
                            placeholder="搜尋資料庫 / schema / 資料表" class="search" />
                        <el-radio-group v-model="statusFilter">
                            <el-radio-button value="all">全部</el-radio-button>
                            <el-radio-button value="active">使用中</el-radio-button>
                            <el-radio-button value="idle">閒置</el-radio-button>
                        </el-radio-group>
                        <div class="idle-days">
                            <span>閒置判定</span>
                            <el-select v-model="idleDays">
                                <el-option v-for="d in IDLE_DAY_OPTIONS" :key="d" :label="`超過 ${d} 天未讀寫`" :value="d" />
                            </el-select>
                        </div>
                        <el-button :icon="Refresh" :loading="loading" @click="load">重新整理</el-button>
                    </div>
                </div>
            </template>

            <div class="summary" v-if="overview">
                <span>{{ counts.databases }} 個資料庫 · {{ counts.schemas }} 個 schema · {{ counts.tables }} 張資料表</span>
                <span class="legend"><i class="dot is-active" />使用中：本系統讀取、有連線存取，或 {{ idleDays }} 天內有讀寫</span>
                <span class="legend"><i class="dot is-idle" />閒置（灰色）：{{ idleDays }} 天以上沒有讀取或修改，共 {{ counts.idleTables }} 張資料表</span>
                <span class="updated">資料時間 {{ formatTime(overview.GeneratedAt) }}</span>
            </div>
            <el-alert v-if="errorText" type="error" :closable="false" show-icon :title="errorText" />
            <el-alert v-if="overview && !overview.HasReadTime" type="warning" :closable="false" show-icon
                :title="`PostgreSQL ${overview.ServerVersion} 沒有資料表最後讀取時間（16 版以上才有），閒置判定只看最後修改時間與目前連線`" />
            <el-alert v-if="overview && !overview.HasFileTime" type="info" :closable="false" show-icon
                title="資料庫帳號沒有讀取資料檔時間的權限，最後修改時間以 autovacuum / analyze 時間估算，可能比實際晚" />

            <div class="table-wrap">
                <el-table :data="rows" row-key="key" height="100%" size="small" v-loading="loading"
                    :expand-row-keys="expandKeys" :row-class-name="rowClass"
                    :empty-text="overview ? '沒有符合條件的項目' : '尚未取得資料'">
                    <el-table-column label="名稱" min-width="280">
                        <template #default="{ row }">
                            <span class="name-cell">
                                <el-icon class="level-icon"><component :is="LEVEL_ICON[row.level as Level]" /></el-icon>
                                <span class="name" :title="row.name">{{ row.name }}</span>
                                <el-tag v-if="row.isSystem" size="small" type="primary" effect="plain">本系統</el-tag>
                                <el-tag v-if="row.kindLabel" size="small" type="info" effect="plain">{{ row.kindLabel }}</el-tag>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="狀態" min-width="240">
                        <template #default="{ row }">
                            <span class="status-cell" :title="row.detail">
                                <el-tag size="small" :type="row.active ? 'success' : 'info'">{{ row.active ? '使用中' : '閒置' }}</el-tag>
                                <span class="reason">{{ row.reasons.join('、') }}</span>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="最後讀取" width="110">
                        <template #default="{ row }">
                            <span v-if="row.lastRead" :title="formatTime(row.lastRead)">{{ formatAgo(row.lastRead) }}</span>
                            <span v-else class="muted">—</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="最後修改" width="110">
                        <template #default="{ row }">
                            <span v-if="row.lastWrite" :title="formatTime(row.lastWrite)">{{ formatAgo(row.lastWrite) }}</span>
                            <span v-else class="muted">—</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="內容" width="130" prop="content" />
                    <el-table-column label="大小" width="100" align="right">
                        <template #default="{ row }">{{ formatBytes(row.sizeBytes) }}</template>
                    </el-table-column>
                    <el-table-column label="操作" width="90" align="center" class-name="col-action">
                        <template #default="{ row }">
                            <template v-if="row.level !== 'table'">
                                <el-tooltip v-if="row.protectedReason" :content="row.protectedReason" placement="left">
                                    <span><el-button link type="danger" :icon="Delete" disabled>移除</el-button></span>
                                </el-tooltip>
                                <el-button v-else link type="danger" :icon="Delete"
                                    :loading="deletingKey === row.key" :disabled="!!deletingKey && deletingKey !== row.key"
                                    @click="confirmDelete(row)">移除</el-button>
                            </template>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, h } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Coin, Folder, Grid, Refresh, Delete, Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getDatabaseOverview, dropDatabase, dropSchema } from '@api/database'
import type { DatabaseOverview, DatabaseInfo, SchemaInfo, TableInfo } from '@api/database'

/** 頁面不持續更新：只有切到此頁籤（含進入頁面、重新整理網頁）或按重新整理時向後端取一次 */
const props = defineProps<{ active: boolean }>()

type Level = 'database' | 'schema' | 'table'
interface TreeRow {
    key: string
    level: Level
    name: string
    database: string
    isSystem: boolean
    kindLabel: string
    active: boolean
    reasons: string[]
    /** 滑過狀態欄時顯示的補充說明 */
    detail: string
    lastRead: string | null
    lastWrite: string | null
    sizeBytes: number | null
    content: string
    connections: number
    tableCount: number
    protectedReason: string | null
    children?: TreeRow[]
}

const LEVEL_ICON = { database: Coin, schema: Folder, table: Grid }
const KIND_LABEL: Record<string, string> = { p: '分割表', m: '實體化檢視', f: '外部表' }
const IDLE_DAY_OPTIONS = [1, 3, 7, 14, 30, 90]
const IDLE_DAYS_KEY = 'db_idle_days'
const DAY_MS = 24 * 60 * 60 * 1000

const overview = ref<DatabaseOverview | null>(null)
const loading = ref(false)
const errorText = ref('')
const deletingKey = ref('')
const keyword = ref('')
const statusFilter = ref<'all' | 'active' | 'idle'>('all')
const idleDays = ref(readIdleDays())

function readIdleDays(): number {
    try {
        const saved = Number(localStorage.getItem(IDLE_DAYS_KEY))
        return IDLE_DAY_OPTIONS.includes(saved) ? saved : 7
    } catch {
        return 7
    }
}

watch(idleDays, value => {
    try {
        localStorage.setItem(IDLE_DAYS_KEY, String(value))
    } catch {
        // localStorage 無法使用時略過，只影響下次開啟的預設值
    }
})

/** 以伺服器產生資料的時間為準判斷多久沒讀寫，避免瀏覽器時間不準 */
const refTime = computed(() => overview.value ? Date.parse(overview.value.GeneratedAt) : Date.now())

function isRecent(ts: string | null): boolean {
    return !!ts && refTime.value - Date.parse(ts) <= idleDays.value * DAY_MS
}

function latest(...values: (string | null)[]): string | null {
    return values.reduce<string | null>((max, v) => (v && (!max || Date.parse(v) > Date.parse(max)) ? v : max), null)
}

function idleReason(lastRead: string | null, lastWrite: string | null): string {
    const last = latest(lastRead, lastWrite)
    return last ? `最後讀寫 ${formatAgo(last)}` : '沒有讀寫紀錄'
}

function buildTable(db: DatabaseInfo, schema: SchemaInfo, t: TableInfo): TreeRow {
    const reasons: string[] = []
    if (t.LockSessions > 0) reasons.push(`${t.LockSessions} 個連線存取中`)
    if (isRecent(t.LastRead)) reasons.push('近期有讀取')
    if (isRecent(t.LastWrite)) reasons.push('近期有修改')
    const active = reasons.length > 0
    return {
        key: `t:${db.Name}/${schema.Name}/${t.Name}`,
        level: 'table',
        name: t.Name,
        database: db.Name,
        isSystem: false,
        kindLabel: KIND_LABEL[t.Kind] ?? '',
        active,
        reasons: active ? reasons : [idleReason(t.LastRead, t.LastWrite)],
        detail: [
            `累計讀取 ${t.ReadCount.toLocaleString()} 次、寫入 ${t.WriteCount.toLocaleString()} 筆`,
            t.LockModes ? `目前鎖定：${t.LockModes}` : ''
        ].filter(Boolean).join('\n'),
        lastRead: t.LastRead,
        lastWrite: t.LastWrite,
        sizeBytes: t.SizeBytes,
        content: `約 ${t.RowEstimate.toLocaleString()} 筆`,
        connections: 0,
        tableCount: 0,
        protectedReason: null
    }
}

function buildSchema(db: DatabaseInfo, s: SchemaInfo): TreeRow {
    const children = s.Tables.map(t => buildTable(db, s, t))
    const activeTables = children.filter(t => t.active).length
    const reasons: string[] = []
    if (s.IsSystemSchema) reasons.push('本系統讀取中')
    if (activeTables > 0) reasons.push(`${activeTables} 張資料表使用中`)
    const active = reasons.length > 0
    return {
        key: `s:${db.Name}/${s.Name}`,
        level: 'schema',
        name: s.Name,
        database: db.Name,
        isSystem: s.IsSystemSchema,
        kindLabel: '',
        active,
        reasons: active ? reasons : [children.length ? idleReason(s.LastRead, s.LastWrite) : '沒有資料表'],
        detail: `擁有者：${s.Owner}`,
        lastRead: s.LastRead,
        lastWrite: s.LastWrite,
        sizeBytes: s.SizeBytes,
        content: `${s.TableCount} 張資料表`,
        connections: 0,
        tableCount: s.TableCount,
        protectedReason: s.ProtectedReason,
        children
    }
}

function buildDatabase(db: DatabaseInfo): TreeRow {
    const children = db.Schemas.map(s => buildSchema(db, s))
    const activeSchemas = children.filter(s => s.active).length
    const reasons: string[] = []
    if (db.IsSystemDatabase) reasons.push('本系統資料庫')
    if (db.Connections > 0) {
        reasons.push(db.ActiveConnections > 0
            ? `${db.Connections} 個連線（${db.ActiveConnections} 個執行中）`
            : `${db.Connections} 個連線`)
    }
    if (activeSchemas > 0) reasons.push(`${activeSchemas} 個 schema 使用中`)
    const active = reasons.length > 0
    let idle = idleReason(db.LastRead, db.LastWrite)
    if (db.Error) idle = `無法讀取：${db.Error}`
    else if (!children.length) idle = '沒有 schema'
    return {
        key: `d:${db.Name}`,
        level: 'database',
        name: db.Name,
        database: db.Name,
        isSystem: db.IsSystemDatabase,
        kindLabel: '',
        active,
        reasons: active ? reasons : [idle],
        detail: [
            `擁有者：${db.Owner}`,
            db.Clients.length ? `連線來源：${db.Clients.join('、')}` : '',
            db.Applications.length ? `連線程式：${db.Applications.join('、')}` : '',
            db.LastActivity ? `最後連線活動：${formatTime(db.LastActivity)}` : '',
            db.Error ? `無法讀取內容：${db.Error}` : ''
        ].filter(Boolean).join('\n'),
        lastRead: db.LastRead,
        lastWrite: db.LastWrite,
        sizeBytes: db.SizeBytes,
        content: db.Error ? '無法讀取' : `${db.Schemas.length} 個 schema`,
        connections: db.Connections,
        tableCount: 0,
        protectedReason: db.ProtectedReason,
        children
    }
}

const tree = computed(() => (overview.value?.Databases ?? []).map(buildDatabase))

const counts = computed(() => {
    const schemas = tree.value.flatMap(d => d.children ?? [])
    const tables = schemas.flatMap(s => s.children ?? [])
    return {
        databases: tree.value.length,
        schemas: schemas.length,
        tables: tables.length,
        idleTables: tables.filter(t => !t.active).length
    }
})

/** 名稱符合時保留整個子樹；狀態篩選保留符合的項目以及通往它的上層 */
function filterTree(rows: TreeRow[], kw: string, status: 'all' | 'active' | 'idle'): TreeRow[] {
    const result: TreeRow[] = []
    for (const row of rows) {
        const nameHit = !kw || row.name.toLowerCase().includes(kw)
        const children = row.children ? filterTree(row.children, nameHit ? '' : kw, status) : undefined
        const statusHit = status === 'all' || row.active === (status === 'active')
        if ((nameHit && statusHit) || children?.length) {
            result.push(children ? { ...row, children } : row)
        }
    }
    return result
}

const isFiltering = computed(() => !!keyword.value.trim() || statusFilter.value !== 'all')
const rows = computed(() => isFiltering.value
    ? filterTree(tree.value, keyword.value.trim().toLowerCase(), statusFilter.value)
    : tree.value)

/** 預設展開到 schema；有篩選時全部展開，才看得到符合的資料表 */
const expandKeys = computed(() => isFiltering.value
    ? rows.value.flatMap(d => [d.key, ...(d.children ?? []).map(s => s.key)])
    : rows.value.map(d => d.key))

function rowClass({ row }: { row: TreeRow }) {
    return row.active ? '' : 'is-idle'
}

function formatTime(ts: string): string {
    return dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
}

function formatAgo(ts: string): string {
    const minutes = Math.floor(Math.max(0, refTime.value - Date.parse(ts)) / 60000)
    if (minutes < 1) return '剛剛'
    if (minutes < 60) return `${minutes} 分鐘前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} 小時前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} 天前`
    if (days < 365) return `${Math.floor(days / 30)} 個月前`
    return `${Math.floor(days / 365)} 年前`
}

function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return '—'
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let value = bytes
    let unit = 0
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024
        unit++
    }
    return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`
}

function pickError(err: any): string {
    return err?.response?.data?.message || err?.message || '連線伺服器失敗'
}

let loadSeq = 0
async function load() {
    const seq = ++loadSeq
    loading.value = true
    errorText.value = ''
    try {
        const data = await getDatabaseOverview()
        if (seq === loadSeq) overview.value = data
    } catch (err) {
        if (seq === loadSeq) errorText.value = `取得資料庫資訊失敗：${pickError(err)}`
    } finally {
        if (seq === loadSeq) loading.value = false
    }
}

async function confirmDelete(row: TreeRow) {
    const isDb = row.level === 'database'
    // 刪除前有連線的資料庫要強制中斷連線，確認視窗會先告知
    const force = isDb && row.connections > 0
    const warn = { style: 'color: var(--el-color-danger); margin-top: 6px' }
    const message = h('div', [
        h('p', isDb
            ? `將永久刪除資料庫「${row.name}」及其中所有 schema 與資料，無法復原。`
            : `將永久刪除資料庫 ${row.database} 的 schema「${row.name}」及其中 ${row.tableCount} 張資料表（CASCADE），無法復原。`),
        row.active ? h('p', warn, `注意：此項目目前判定為使用中（${row.reasons.join('、')}）。`) : null,
        force ? h('p', warn, `目前有 ${row.connections} 個連線，刪除時會強制中斷這些連線。`) : null,
        h('p', { style: 'margin-top: 6px' }, `請輸入「${row.name}」確認移除：`)
    ])

    try {
        await ElMessageBox.prompt(message, isDb ? '移除資料庫' : '移除 Schema', {
            type: 'warning',
            confirmButtonText: '確認移除',
            cancelButtonText: '取消',
            confirmButtonClass: 'el-button--danger db-danger-confirm',
            closeOnClickModal: false,
            inputPlaceholder: row.name,
            inputValidator: (value: string) => value === row.name || '名稱不符'
        })
    } catch {
        return
    }

    deletingKey.value = row.key
    try {
        const res: any = isDb ? await dropDatabase(row.name, force) : await dropSchema(row.database, row.name)
        ElMessage.success(res?.message || '已移除')
        await load()
    } catch (err) {
        ElMessage.error(pickError(err))
    } finally {
        deletingKey.value = ''
    }
}

watch(() => props.active, active => {
    if (active) load()
}, { immediate: true })
</script>

<style scoped>
.db-manager {
    height: 100%;
    width: 100%;
    padding: 12px;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.panel :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
}

.title {
    display: flex;
    align-items: baseline;
    gap: 12px;
    flex-wrap: wrap;
}

.title .sub {
    font-size: 12px;
    font-weight: normal;
    opacity: 0.7;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.toolbar .search {
    width: 240px;
}

.idle-days {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    white-space: nowrap;
}

.idle-days .el-select {
    width: 150px;
}

.summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 18px;
    font-size: 12px;
    color: var(--text-muted);
}

.summary .updated {
    margin-left: auto;
}

.legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.dot.is-active {
    background: var(--el-color-success);
}

.dot.is-idle {
    background: var(--el-color-info);
    opacity: 0.6;
}

.table-wrap {
    flex: 1;
    min-height: 300px;
}

.name-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    vertical-align: middle;
}

.name-cell .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.level-icon {
    flex: none;
    color: var(--accent-color);
}

.status-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
}

.status-cell .reason {
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.muted {
    opacity: 0.5;
}

/* 閒置（沒有存取、很久沒讀寫）整列變灰，操作欄維持原樣方便移除 */
.table-wrap :deep(.el-table__row.is-idle td.el-table__cell:not(.col-action) .cell) {
    color: var(--el-text-color-disabled);
    filter: grayscale(1);
    opacity: 0.6;
}

@media (max-width: 900px) {
    .toolbar .search {
        width: 100%;
    }
}
</style>
<style>
/* 確認移除按鈕：蓋掉 style.css 全域 primary 漸層，維持危險色 */
.el-button--primary.db-danger-confirm:not(.is-plain):not(.is-link):not(.is-text):not(.is-disabled) {
    background-image: none;
}
</style>
