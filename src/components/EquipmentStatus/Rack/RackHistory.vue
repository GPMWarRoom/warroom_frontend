<template>
    <div class="rack-history">
        <div class="dashboard-grid">
            <!-- 左半部：Chart -->
            <div class="panel">
                <div class="card">
                    <h3 class="flex-header">
                        <span>Rack 水位變化</span>
                        <el-select v-model="selectedWip" size="small" style="width: 150px;">
                            <el-option v-for="wip in availableWips" :key="wip" :label="wip" :value="wip" />
                        </el-select>
                    </h3>
                    <div class="content chart-wrapper">
                        <LineChart
                            v-if="chartData.length > 0"
                            :datas="chartData"
                            :xAxisName="'時間'"
                            :yAxisName="'水位'"
                            class="w-100 h-100"
                        />
                        <el-empty v-else description="無水位資料" class="w-100 h-100" />
                    </div>
                </div>
            </div>
            
            <!-- 右半部：List -->
            <div class="panel">
                <div class="card">
                    <h3 class="flex-header">
                        <span>Rack水位紀錄列表</span>
                        <div>
                            <el-button size="small" type="primary" @click="exportTodayCsv">匯出當日紀錄CSV</el-button>
                            <el-button size="small" type="success" @click="exportFilteredCsv">按照篩選時間匯出CSV</el-button>
                        </div>
                    </h3>
                    <div class="content">
                        <div class="table-wrapper">
                            <el-table :data="paginatedData" height="100%" stripe style="width: 100%">
                                <el-table-column prop="wipName" label="Rack 名稱" />
                                <el-table-column prop="level" label="水位%" />
                                <el-table-column label="異動CSTID">
                                    <template #default="scope">
                                        <div v-for="(id, index) in String(scope.row.cstId).split(',')" :key="index">
                                            {{ id.trim() }}
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="updateTime" label="更新時間" />
                            </el-table>
                        </div>
                        <div class="pagination-wrapper">
                            <el-pagination
                                v-model:current-page="currentPage"
                                :page-size="pageSize"
                                layout="total, prev, pager, next"
                                :total="total"
                                @current-change="handleCurrentChange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import LineChart from '@/components/common/charts/LineChart.vue'
import { realTimeStore } from '@/stores/realTime'

const realTimeData = realTimeStore()

const allData = computed(() => {
    // 假設你的 store 有接收到 RackHistory 的陣列
    const rawHistory = realTimeData.RackHistory || [] 
    
    // 將後端的欄位對應到前端原有的格式
    return rawHistory.map((item: any) => ({
        wipName: item.RackName,
        level: item.Level,
        cstId: item.CSTID || '-',
        updateTime: dayjs(item.UpdateTime).format('YYYY-MM-DD HH:mm:ss'),
        timestamp: dayjs(item.UpdateTime).valueOf()
    })).sort((a, b) => b.timestamp - a.timestamp); // 最新在最上面
})

const availableWips = computed(() => {
    return Array.from(new Set(allData.value.map(item => item.wipName)))
})
const selectedWip = ref(availableWips.value[0] || '')

import { watch } from 'vue'
watch(availableWips, (newWips) => {
    // 當可選的 WIP 清單改變時，如果目前選中的 WIP 不在清單內，就自動選擇第一個
    if (!selectedWip.value || !newWips.includes(selectedWip.value)) {
        selectedWip.value = newWips[0] || ''
    }
})

// 時間過濾：按照主頁篩選的時間顯示資料
const timeFilteredData = computed(() => {
    if (realTimeData.DateRange && realTimeData.DateRange.length === 2) {
        const start = dayjs(realTimeData.DateRange[0]).valueOf()
        const end = dayjs(realTimeData.DateRange[1]).valueOf()
        return allData.value.filter(item => item.timestamp >= start && item.timestamp <= end)
    }
    return allData.value
})

// 1. 過濾出所選 WIP 的紀錄供圖表使用
const filteredData = computed(() => {
    if (!selectedWip.value) return []
    return timeFilteredData.value.filter(item => item.wipName === selectedWip.value)
})

// 2. 分頁邏輯
const currentPage = ref(1)
const pageSize = ref(15)
const total = computed(() => timeFilteredData.value.length)

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return timeFilteredData.value.slice(start, end)
})

const handleCurrentChange = (val: number) => {
    currentPage.value = val
}

// 3. Chart Data (依照時間升冪排列給圖表使用)
const chartData = computed(() => {
    if (filteredData.value.length === 0) return []
    
    // 圖表通常是左到右 (舊到新)，所以重新排序
    const sorted = [...filteredData.value].sort((a, b) => a.timestamp - b.timestamp)
    return [
        {
            name: 'WIP 水位%',
            xData: sorted.map(item => dayjs(item.timestamp).format('HH:mm')),
            yData: sorted.map(item => item.level)
        }
    ]
})

// CSV 匯出共用函數
const downloadCsv = (data: any[], filename: string) => {
    if (!data.length) {
        ElMessage.warning('無資料可匯出')
        return
    }
    const headers = ['WIP 名稱', '水位%', '異動CSTID', '更新時間']
    const csvRows = [
        headers.join(','),
        ...data.map(row => {
            const formattedCstId = `"${String(row.cstId).replace(/,/g, '\n')}"`
            return `${row.wipName},${row.level},${formattedCstId},${row.updateTime}`
        })
    ]
    const csvContent = "\uFEFF" + csvRows.join('\n') // 加入 BOM 讓 Excel 正常顯示中文
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// 匯出當日紀錄CSV
const exportTodayCsv = () => {
    const startOfToday = dayjs().startOf('day').valueOf()
    const endOfToday = dayjs().endOf('day').valueOf()
    const todayData = allData.value.filter(item => item.timestamp >= startOfToday && item.timestamp <= endOfToday)
    downloadCsv(todayData, `AllRack_TodayData_${dayjs().format('YYYYMMDD')}.csv`)
}

// 按照篩選時間匯出CSV (使用 AGVC.vue 的 DateRange)
const exportFilteredCsv = () => {
    if (realTimeData.DateRange && realTimeData.DateRange.length === 2) {
        const start = dayjs(realTimeData.DateRange[0]).valueOf()
        const end = dayjs(realTimeData.DateRange[1]).valueOf()
        const rangeData = allData.value.filter(item => item.timestamp >= start && item.timestamp <= end)
        const startDateStr = dayjs(start).format('YYYYMMDD')
        const endDateStr = dayjs(end).format('YYYYMMDD')
        downloadCsv(rangeData, `AllRack_Data_${startDateStr}_to_${endDateStr}.csv`)
    } else {
        ElMessage.warning('未設定有效的時間範圍')
    }
}
</script>

<style scoped lang="scss">
.rack-history {
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    padding-top: 8px;
    overflow: hidden; /* 保證不超出黃框(父容器) */
}

.dashboard-grid {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 8px; /* 左右卡片間距 */
}

.panel {
    flex: 1; /* 左右各佔 50% */
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.card {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden; // 防止內容超出圓角
    
    h3 {
        margin: 0;
        padding: 12px 16px;
        background: #23272f;
        color: #fff;
        font-size: 1.1rem;
        border-bottom: 1px solid #333;
        flex-shrink: 0; // 標題高度固定
    }

    .flex-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
    }

    .content {
        flex: 1;
        min-height: 0; // 關鍵：讓 flex 容器可以向內縮小，不被內容撐開
        display: flex;
        flex-direction: column;
    }

    .chart-wrapper {
        padding: 10px;
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
}

.table-wrapper {
    flex: 1;
    min-height: 0; /* 讓表格自己處理滾動，不會撐破父容器 */
    width: 100%;
}

.pagination-wrapper {
    padding: 8px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0; /* 固定高度不被擠壓 */
}

.w-100 { width: 100%; }
.h-100 { height: 100%; }

// Table 樣式調整 (深色主題)
:deep(.el-table) {
    background-color: transparent !important;
    --el-table-border-color: #333;
    --el-table-header-bg-color: #23272f;
    --el-table-header-text-color: #fff;
    --el-table-tr-bg-color: #1e1e1e;
    --el-table-row-hover-bg-color: #2c2c2c;
}
:deep(.el-table th.el-table__cell) {
    background-color: #23272f !important;
    border-bottom: 1px solid #333 !important;
}
:deep(.el-table tr) {
    background-color: #1e1e1e !important;
}
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
    background: #23272f !important;
}
:deep(.el-table td.el-table__cell) {
    border-bottom: 1px solid #333 !important;
    color: #e5e7eb;
}

// Pagination 樣式調整 (深色主題)
:deep(.el-pagination) {
    --el-pagination-bg-color: transparent;
    --el-pagination-text-color: #e5e7eb;
    --el-pagination-button-disabled-bg-color: transparent;
    --el-pagination-hover-color: #409EFF;
}
:deep(.el-pagination .el-pager li) {
    background-color: transparent !important;
    color: #e5e7eb;
}
:deep(.el-pagination .el-pager li.is-active) {
    color: #409EFF;
    font-weight: bold;
}
:deep(.el-pagination button) {
    background-color: transparent !important;
    color: #e5e7eb;
}
:deep(.el-pagination__total) {
    color: #e5e7eb;
}
</style>