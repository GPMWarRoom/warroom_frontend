export class VersionInfo {
    Name: string;
    Version: string;

    constructor() {
        this.Name = "Test";
        this.Version = "1.0.0"
    }
}


export class AGVSFieldVersionInfo extends VersionInfo {
    floor: number;
    vehiclesVersions: VersionInfo[];

    constructor(floor = 1, name = "Test", version = "1.0.0") {
        super();
        this.floor = floor;
        this.Name = name;
        this.Version = version;
        let vehicleVersionInfo = new VersionInfo();
        this.vehiclesVersions = [];
        this.vehiclesVersions.push(vehicleVersionInfo);
    }
}


