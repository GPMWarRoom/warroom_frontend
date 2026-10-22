import axios from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * 撈 LOG API（GPM_Tools_API）
 *
 * GPM_Tools_API 架在各場域派車主機上（預設 http://<主機IP>:5051），只提供六支撈取 API：
 *   GET /api/log/{kind}?date=yyyy-MM-dd&includeConfig=true&agvName=xxx&area=場域  → 直接回傳 zip
 *
 * area 會被 API 當成存放資料夾（ApilogFilelocat + 場域名稱），這裡直接帶 dashboard 的 schema。
 *
 * API 位址預設由 dashboardServer 提供：派車主機 IP 與抓派車地圖用的是同一個
 * （SysStatus.ExternalNetworkIP），只有埠號不同（預設 5051）。
 *
 * public/config.json 的 LogApi 只是覆寫／備援：
 *
 * "LogApi": {
 *   "default": "",                                    // 都問不到位址時使用
 *   "servers": {
 *     "UMTC_YM_3F_ABF": "http://10.22.141.10:5051"    // 指定就以這個為準（不問 dashboardServer）
 *   }
 * }
 */
import { getLogApiEndpoint } from './agvc'

export type LogKindKey = 'agvs' | 'vms' | 'cim' | 'mcs' | 'gpm' | 'gpmagv'

export interface LogKindInfo {
    key: LogKindKey
    name: string
    /** 是否需要指定 AGV（車載類需要） */
    needAgvName: boolean
    /** 是否支援「含參數檔」 */
    supportIncludeConfig: boolean
    /** 畫面上顯示的來源說明 */
    source: string
}

/** 六種 LOG（與 GPM_Tools_API 的六支 API 一一對應） */
export const LOG_KINDS: LogKindInfo[] = [
    { key: 'agvs', name: 'AGVS LOG', needAgvName: false, supportIncludeConfig: true, source: '派車主機：AGVS LOG + 派車參數' },
    { key: 'vms', name: 'VMS LOG', needAgvName: false, supportIncludeConfig: false, source: '派車主機：VMS LOG（無參數檔）' },
    { key: 'cim', name: 'CIM LOG', needAgvName: false, supportIncludeConfig: true, source: '派車主機：CIM LOG + CIM 參數' },
    { key: 'mcs', name: 'MCS LOG', needAgvName: false, supportIncludeConfig: true, source: '派車主機：GPM MCS LOG + MCS 參數' },
    { key: 'gpm', name: 'GPM LOG（車控）', needAgvName: true, supportIncludeConfig: true, source: '派車主機 tools 連到 AGV 撈取：/home/gpm/GPMLog + agv_control_settings' },
    { key: 'gpmagv', name: 'GPM_AGV_LOG（車載）', needAgvName: true, supportIncludeConfig: true, source: '派車主機 tools 連到 AGV 撈取：/home/gpm/GPM_AGV_LOG（KG 車為 KgLog）+ param' }
]

export interface CollectParams {
    date: string
    includeConfig: boolean
    agvName?: string
}

type LogServerSetting = string | {
    url?: string
    /** 明確列出車號（最優先） */
    agvs?: string[]
}

interface LogApiConfig {
    default?: string
    servers?: Record<string, LogServerSetting>
}

let appConfigCache: { API_URL?: string; LogApi?: LogApiConfig } | null = null

async function loadAppConfig() {
    if (appConfigCache) return appConfigCache
    try {
        const res = await fetch('/config.json')
        appConfigCache = await res.json()
    } catch (err) {
        console.error('無法載入 config.json', err)
        appConfigCache = {}
    }
    return appConfigCache as { API_URL?: string; LogApi?: LogApiConfig }
}

function pickServer(cfg: LogApiConfig, schema: string): LogServerSetting | undefined {
    return cfg.servers ? cfg.servers[schema] : undefined
}

/** 使用者在畫面上自己填的派車系統 IP（每個場域各自記在瀏覽器） */
const IP_OVERRIDE_PREFIX = 'logApiIp:'

export function getIpOverride(schema: string): string {
    if (!schema) return ''
    try {
        return localStorage.getItem(IP_OVERRIDE_PREFIX + schema) || ''
    } catch {
        return ''
    }
}

export function setIpOverride(schema: string, ip: string) {
    if (!schema) return
    try {
        if (ip && ip.trim()) localStorage.setItem(IP_OVERRIDE_PREFIX + schema, ip.trim())
        else localStorage.removeItem(IP_OVERRIDE_PREFIX + schema)
    } catch {
        // localStorage 不可用就算了，至少這次操作仍可使用
    }
}

/** 把使用者填的 IP（或含埠號／含 http 的字串）整理成 API 位址 */
export function normalizeApiBase(input: string, port: number = 5051): string {
    const raw = (input || '').trim()
    if (!raw) return ''

    const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`
    try {
        const url = new URL(withScheme)
        if (!url.port) url.port = String(port || 5051)
        return url.origin
    } catch {
        return ''
    }
}

/** 把 API 位址轉回欄位上顯示的 IP；埠號是預設值就只顯示 IP */
export function displayHost(base: string, defaultPort: number = 5051): string {
    if (!base) return ''
    try {
        const url = new URL(base)
        return url.port && Number(url.port) !== defaultPort ? url.host : url.hostname
    } catch {
        return ''
    }
}

/** dashboardServer 回報的位址快取（同一場域不用每次都問） */
const serverBaseCache = new Map<string, string>()

export interface LogApiEndpointInfo {
    /** 派車系統 IP（SysStatus.ExternalNetworkIP） */
    ip: string
    port: number
    url: string
}

/** 向 dashboardServer 詢問該場域派車主機的位址（與抓派車地圖同一台） */
export async function getLogApiEndpointInfo(schema: string): Promise<LogApiEndpointInfo> {
    const empty: LogApiEndpointInfo = { ip: '', port: 5051, url: '' }
    if (!schema) return empty

    try {
        const res: any = await getLogApiEndpoint(schema)
        const data = res?.url !== undefined || res?.ip !== undefined ? res : res?.data
        const info: LogApiEndpointInfo = {
            ip: String(data?.ip || ''),
            port: Number(data?.port) || 5051,
            url: String(data?.url || '')
        }
        if (info.url) serverBaseCache.set(schema, info.url)
        return info
    } catch (err) {
        console.error('取得撈 LOG API 位址失敗', err)
        return empty
    }
}

async function fetchBaseFromServer(schema: string): Promise<string> {
    if (!schema) return ''
    if (serverBaseCache.has(schema)) return serverBaseCache.get(schema) as string

    const info = await getLogApiEndpointInfo(schema)
    return info.url
}

/**
 * 取得指定場域的撈 LOG 服務位址，依序：
 * 1. 使用者在畫面上填的派車系統 IP（解鎖後修改的值）
 * 2. config.json 明確指定的 servers[schema]
 * 3. dashboardServer 回報的派車主機位址（與抓派車地圖同一個 IP）
 * 4. config.json 的 default
 *
 * 都沒有就回空字串（畫面會提示取不到位址），不再退回 dashboard 的 API_URL，
 * 免得把撈 LOG 的請求送到 dashboardServer 上。
 */
export async function getLogApiBase(schema: string): Promise<string> {
    const override = getIpOverride(schema)
    if (override) {
        const base = normalizeApiBase(override)
        if (base) return base
    }

    const cfg = await loadAppConfig()
    const logApi = cfg.LogApi || {}
    const server = pickServer(logApi, schema)
    const configUrl = typeof server === 'string' ? server : server?.url

    const base = configUrl || (await fetchBaseFromServer(schema)) || logApi.default || ''
    return base.replace(/\/+$/, '')
}

/** 場域切換或設定更新後清掉位址快取 */
export function clearLogApiBaseCache(schema?: string) {
    if (schema) serverBaseCache.delete(schema)
    else serverBaseCache.clear()
}

export type AgvOptionSource = 'db' | 'config' | 'realtime' | 'fixed'

/** 沒有車號清單時使用的預設車號（tools 會依場域 schema 對應到 AGVsIP） */
export const DEFAULT_AGV_NAME = 'AGV_001'

export interface AgvOptionResult {
    options: string[]
    source: AgvOptionSource
}

/**
 * 產生車載 LOG 的車號下拉選單，依序：
 * 1. 場域資料庫的車號（AgvStates.AGV_Name，由 dashboardServer 提供）
 * 2. config.json 明確列出的 agvs
 * 3. 即時監控推播的車名
 * 4. 以上都沒有 → 不給選項，畫面直接預設固定格式的 AGV_001（可自行修改）
 *
 * 車號會原樣送給 GPM_Tools_API，由它依「場域 schema + 車號」對應到 tools 的 AGVsIP，
 * 例如 area=UMTC_YM_3F_ABF、agvName=AGV_001 → YM3FABF_AGV1 → 10.22.141.201。
 */
export async function getAgvOptions(
    schema: string,
    sources: { dbNames?: string[]; realtimeNames?: string[] } = {}
): Promise<AgvOptionResult> {
    const cfg = await loadAppConfig()
    const server = pickServer(cfg.LogApi || {}, schema)
    const setting = typeof server === 'object' && server ? server : {}

    const dbNames = unique(sources.dbNames)
    if (dbNames.length) return { options: dbNames, source: 'db' }

    if (Array.isArray(setting.agvs) && setting.agvs.length) {
        return { options: setting.agvs, source: 'config' }
    }

    const realtimeNames = unique(sources.realtimeNames)
    if (realtimeNames.length) return { options: realtimeNames, source: 'realtime' }

    // 沒有任何車號來源：不提供下拉選項，畫面會預設 AGV_001
    return { options: [], source: 'fixed' }
}

function unique(names?: string[]): string[] {
    return Array.from(new Set((names || []).filter(Boolean).map(String)))
}

/** 撈 LOG 專用的 axios：撈檔（尤其車載 SFTP）會跑一陣子，不設 timeout */
const logHttp: AxiosInstance = axios.create({ timeout: 0 })

/** 從回應標頭取出檔名 */
function pickFileName(disposition: string | undefined, fallback: string): string {
    if (!disposition) return fallback
    const match = disposition.match(/filename\*?=['"]?(?:UTF-8'')?([^'";\n]+)['"]?/i)
    return match && match[1] ? decodeURIComponent(match[1]) : fallback
}

export interface DownloadResult {
    fileName: string
    sizeBytes: number
    /** API 端實際撈取耗時（X-Log-Elapsed-Ms） */
    elapsedMs: number
    /** 檔案存放在派車主機上的完整路徑（X-Log-File-Path） */
    filePath: string
    /** API 過程中的提示（X-Log-Message） */
    message: string
}

/**
 * 呼叫撈 LOG API 並讓瀏覽器存檔。
 *
 * 六種 LOG（含車載／車控）都送到該區域派車主機上的 tools，由 tools 執行撈取，
 * 所以一律需要派車系統的位址（base），不依賴 dashboard 資料庫有沒有上報紀錄。
 *
 * API 是「撈完才回應」：車載 LOG 可能要好幾分鐘，這段期間請求會一直等著，
 * 所以這裡不設 timeout，成功／失敗都以 API 的回應為準。
 *
 * @param base 該區域 tools 的位址，例如 http://10.22.141.10:5051
 * @param onProgress 已接收位元組 / 總位元組（總長度未知時為 0）；撈取階段不會有進度
 */
export async function downloadLog(
    base: string,
    schema: string,
    kind: LogKindKey,
    params: CollectParams,
    onProgress?: (loaded: number, total: number) => void
): Promise<DownloadResult> {
    const res = await logHttp.get(`${base.replace(/\/+$/, '')}/api/log/${kind}`, {
        params: {
            date: params.date,
            includeConfig: params.includeConfig,
            area: schema,
            ...(params.agvName ? { agvName: params.agvName } : {})
        },
        responseType: 'blob',
        onDownloadProgress: e => onProgress?.(e.loaded, e.total ?? 0)
    })

    const fileName = pickFileName(res.headers['content-disposition'], `${kind}_${params.date}.zip`)
    const blob = res.data as Blob

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    const rawMessage = res.headers['x-log-message']
    const rawPath = res.headers['x-log-file-path']
    return {
        fileName,
        sizeBytes: blob.size,
        elapsedMs: Number(res.headers['x-log-elapsed-ms']) || 0,
        filePath: rawPath ? decodeURIComponent(rawPath) : '',
        message: rawMessage ? decodeURIComponent(rawMessage) : ''
    }
}

/**
 * 取出錯誤訊息。
 * 因為用 responseType: 'blob'，錯誤的 JSON 也會是 Blob，要先讀成文字再解析。
 */
export async function pickLogApiError(err: any, fallback = '撈取失敗'): Promise<string> {
    const data = err?.response?.data
    try {
        if (data instanceof Blob) {
            const text = await data.text()
            const json = JSON.parse(text)
            if (json?.message) return json.message
        } else if (data?.message) {
            return data.message
        }
    } catch {
        // 不是 JSON 就往下走
    }
    if (err?.message === 'Network Error') {
        return '無法連線到該區域的 tools，請確認派車系統 IP 是否正確、網路是否可通、tools 是否已啟動'
    }
    return err?.message || fallback
}
