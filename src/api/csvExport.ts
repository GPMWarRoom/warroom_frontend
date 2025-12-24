import http from '../utils/http' // 這是你導出的 axios 實例

/**
 * 匯出相關 API
 */
const csvExportAPI = {
    exportRoute: '/api/csvExport',

    /**
     * 通用匯出功能
     */
    exportToCsv: async (target: string, schema: string, dateRange: string[] | null, filters: any) => {
        const payload = {
            target,
            schema,
            dateRange,
            filters
        };

        // 注意：這裡直接使用 http 實例發送請求 (而不是呼叫你自己封裝的 post 函式)
        // 這樣才能確保拿到包含 headers 的完整 AxiosResponse
        return await http.post(csvExportAPI.exportRoute, payload, {
            responseType: 'blob' 
        });
    }
}

export { csvExportAPI }