/** 稼動狀態的固定顏色（圓餅圖與周邊設備橫向直條圖共用，同一狀態在兩種圖顏色一致） */
export const STATUS_COLORS: Record<string, string> = {
    Run: '#2ecc71',
    Down: '#c62828',
    Alarm: '#e53935',
    Idle: '#fadb14',
    PM: '#ff0088',
    Unknown: '#616161'
}

/** 不在 STATUS_COLORS 裡的項目依序使用的顏色 */
export const FALLBACK_COLORS = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666',
    '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
]
