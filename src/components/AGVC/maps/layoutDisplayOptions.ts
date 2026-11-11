import { useSessionRef } from '@/composables/useSessionState'

// 即時監控 AGVS Layout 的顯示選項（地圖左上 +/- 下方的 T、H、G 按鈕）。
// 卡片與放大檢視共用同一份，並存在 sessionStorage，自動重新整理後維持原本的選擇
const isBoolean = (value: unknown) => typeof value === 'boolean'

/** T：點位名稱只顯示 Tag ID */
export const showTagOnly = useSessionRef('layout-tag-only', false, isBoolean)

/** H：隱藏 AGV，以及任務站點的執行中／待執行提示 */
export const hideVehicles = useSessionRef('layout-hide-agv', false, isBoolean)

/** G：隱藏 1 公尺網格 */
export const hideGrid = useSessionRef('layout-hide-grid', false, isBoolean)
