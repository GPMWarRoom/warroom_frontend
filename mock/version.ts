const createVersionList = () => {
    return [
        {
            floor: 1,
            fieldVersions: [
                {
                    name: "AOI",
                    version: "1.1.0",
                    vehiclesVersions: [
                        { name: "AGV1", version: "1.0.0" },
                        { name: "AGV2", version: "1.0.0" }
                    ]
                },
                {
                    name: "MEC",
                    version: "1.1.0",
                    vehiclesVersions: [
                        { name: "AGV1", version: "1.0.0" },
                        { name: "AGV2", version: "1.0.0" },
                        { name: "AGV3", version: "1.2.0" }
                    ]
                }
            ]
        },

        {
            floor: 2,
            fieldVersions: [
                {
                    name: "MEC",
                    version: "1.2.0",
                    vehiclesVersions: [
                        { name: "AGV1", version: "1.0.0" },
                        { name: "AGV2", version: "1.0.0" }
                    ]
                }
            ]
        },
        {
            floor: 3,
            fieldVersions: [
                {
                    name: "AOI",
                    version: "1.3.0",
                    vehiclesVersions: [
                        { name: "AGV1", version: "1.0.0" },
                        { name: "AGV2", version: "1.0.0" }]
                },
                {
                    name: "MEC",
                    version: "1.2.0",
                    vehiclesVersions: [
                        { name: "AGV1", version: "1.0.0" },
                        { name: "AGV2", version: "1.0.0" }
                    ]
                },
                {
                    name: "YEL",
                    version: "1.2.0",
                    vehiclesVersions: [
                        { name: "AGV1", version: "1.0.0" },
                        { name: "AGV2", version: "1.0.0" },
                        { name: "AGV3", version: "1.0.0" },
                        { name: "AGV4", version: "1.0.0" }
                    ]
                }

            ]
        }
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