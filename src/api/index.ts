import axios from '../utils/axios.js'
import type { AGVSFieldVersionInfo } from '../models/Version/FieldVersionModels.ts'

export async function getVersion(): Promise<AGVSFieldVersionInfo[]> {
    const response = await axios.get('/api/version/list') as { data: AGVSFieldVersionInfo[] }
    return response.data
}

/**
 * 取得場域資訊
 * @returns {Promise<FieldInfo[]>}
 */
export const getField = async () => {
    const response = await axios.get('/api/FieldInfo/FieldsInfo')
    console.log(response);
    return response
}

