import aoiMapData from './maps/YM_2FAOI_20240412.json';
export default {
    url: '/api/map',
    method: 'get',
    response: () => {
        return {
            code: 200,
            data: aoiMapData
        }
    }

}
