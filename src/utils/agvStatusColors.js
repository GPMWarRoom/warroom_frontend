/**
 * RealTimeAvailabilitys.Main_Status（MAIN_STATUS 列舉）
 * 注意：與 EQStatus_AGV.Status（0 idle / 1 run / 2 down / 3 charging）不同，不可混用
 * 0 Initializing, 1 IDLE, 2 RUN, 3 DOWN, 4 Charging, 5 Unknown
 */
export const AGV_STATUS_BY_CODE = {
    0: 'initializing',
    1: 'idle',
    2: 'run',
    3: 'down',
    4: 'charging',
    5: 'unknown'
}

export const AGV_STATUS_COLORS = {
    initializing: '#909399',
    idle: '#E6A23C',
    run: '#67C23A',
    down: '#F56C6C',
    charging: '#409EFF',
    unknown: '#909399'
}

/** 黑底圖表狀態背景 */
export const AGV_STATUS_BG = {
    initializing: 'rgba(144, 147, 153, 0.72)',
    idle: 'rgba(230, 162, 60, 0.72)',
    run: 'rgba(103, 194, 58, 0.72)',
    down: 'rgba(245, 108, 108, 0.72)',
    charging: 'rgba(64, 158, 255, 0.72)',
    unknown: 'rgba(144, 147, 153, 0.55)'
}
