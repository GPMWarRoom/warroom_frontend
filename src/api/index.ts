import axios from '../utils/axios.js'
import { AGVSFieldVersionInfo } from '../models/Version/FieldVersionModels.ts'
export async function getVersion (): Promise<AGVSFieldVersionInfo[]> {
    //use axios to get mock data from json file to simulate api call
    // const response = await fetch('/src/assets/mock/versions.json')
    // let data= await response.json()
    // return data

    const response = await axios.get('/src/assets/mock/versions.json')
    let result: AGVSFieldVersionInfo[] = []
    Object.assign(result, response.data)
    return result
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

