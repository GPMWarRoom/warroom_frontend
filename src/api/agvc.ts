import { post } from '../utils/http';

export function getTrafficAvailabilitys(schema: string, dateRange: any[]): Promise<any> {
    return post('/api/AGVC/TrafficAvailabilitys', {
        schema,
        dateRange
    });
}

export function getTransferAvailabilitys(
    schema: string,
    dateRange: any[],
    unloadEQ?: string,
    source?: string,
    target?: string,
    needTaskList?: boolean
): Promise<any> {
    // 🚨 修正：將參數拉平，並將 needTaskList 映射到 C# DTO 的 IsHasTaskList
    return post('/api/AGVC/TransferAvailabilitys', {
        schema,
        dateRange,
        unloadEQ,
        source,
        target,
        isHasTaskList: needTaskList 
    });
}

export function getEqpAvailabilitys(schema: string, dateRange: any[]): Promise<any> {
    return post('/api/AGVC/EqpAvailabilitys', {
        schema,
        dateRange
    });
}

export function getWipHistory(schema: string, dateRange: any[]): Promise<any> {
    return post('/api/AGVC/WipHistory', {
        schema,
        dateRange
    });
}

export function getBatteryRecords(schema: string, agvName?: string, date?: string): Promise<any> {
    return post('/api/AGVC/BatteryRecords', {
        schema,
        agvName: agvName || '',
        date: date || ''
    }, { timeout: 60000 });
}

export function queryUtilizationEQ(schema: string, target: string, dateRange: any[], params: any): Promise<any> {
    return post('/api/AGVC/UtilizationEQ', {
        schema,
        target,
        dateRange,
        filters: params
    });
}

export function queryHistoryAction(schema: string, target: string, dateRange: any[], params: any): Promise<any> {
    return post('/api/AGVC/HistoryAction', {
        schema,
        target,
        dateRange,
        filters: params
    });
}