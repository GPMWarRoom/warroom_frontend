/** 後端未填任務時間時給的是預設值（1970 年或更早，例如 0001-01-01），畫面一律顯示這個符號表示未知 */
export const UNKNOWN_TIME_TEXT = '---'

/** 任務開始／結束時間的顯示文字：空值或 1970 年以前的預設時間顯示 ---，其餘原樣顯示 */
export function formatTaskTime(value: unknown): string {
    if (value === null || value === undefined || value === '') return UNKNOWN_TIME_TEXT
    const text = String(value)
    const year = Number(text.match(/^\s*(\d{4})/)?.[1])
    if (year && year <= 1970) return UNKNOWN_TIME_TEXT
    return text
}

/** 給 el-table-column 的 formatter 使用 */
export const taskTimeColumnFormatter = (_row: unknown, _column: unknown, cellValue: unknown) => formatTaskTime(cellValue)
