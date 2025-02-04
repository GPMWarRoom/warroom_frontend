import { AGVSFieldVersionInfo } from '../src/models/Version/FieldVersionModels.ts'  
const createVersionList = () => {
    return [
        { floor: 1, Name: "AOI", Version: "1.1.0" },
        { floor: 1, Name: "MEC", Version: "1.2.0" },
        { floor: 2, Name: "AOI", Version: "1.3.0" },
        { floor: 2, Name: "MEC", Version: "1.4.0" },
    ]
}
export default [
    {
        url: '/api/version/list',
        method: 'get',
        response: ({ body }: any) => {
            return createVersionList()
        }
    }
]