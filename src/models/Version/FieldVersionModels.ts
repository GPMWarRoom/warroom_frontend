export interface VersionInfo {
    Name: string;
    Version: string;
}


export interface AGVSFieldVersionInfo extends VersionInfo {
    floor: number;
    vehiclesVersions: VersionInfo[];
}




