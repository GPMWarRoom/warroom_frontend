import { get } from '../utils/axios'

const api = {
    map: '/api/map'
}

export const getMap = async () => {
    return get(api.map).then((res: any) => {
        return res.data
    })
}