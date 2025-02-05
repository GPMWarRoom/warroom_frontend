import http from '../utils/http'


interface VersionBase {
    name: string
    version: string
}

interface VehicleVersion extends VersionBase {
}


interface FieldVersion extends VersionBase {
    vehiclesVersions: VehicleVersion[]
}

export interface FloorVersions {
    floor: number
    fieldVersions: FieldVersion[]
}


/**
 * 系統API
 */
const systemApi = {

    getVersionApiRoute: '/api/version/list',
    getVersionList: async () => {
        return await http.get<FloorVersions[]>(systemApi.getVersionApiRoute).then(res => res.data);
    }

}

export { systemApi }

