interface Point {
    X: number;
    Y: number;
    Name: string;
    TagNumber: number;
    Direction: number;
    Direction_Avoid: number;
    UseAvoidThetaWhenStopAtWaitingPointOfEntryRegion: boolean;
    AlwayTurnToAvoidThetaWhenWaitingTrafficControl: boolean;
    Direction_Secondary_Point: number;
    AGV_Alarm: boolean;
    Enable: boolean;
    IsStandbyPoint: boolean;
    IsSegment: boolean;
    IsOverlap: boolean;
    IsParking: boolean;
    IsAvoid: boolean;
    IsVirtualPoint: boolean;
    IsAutoDoor: boolean;
    IsExtinguishing: boolean;
    IsTrafficCheckPoint: boolean;
    IsTransferStation: boolean;
    IsNarrowPath: boolean;
    InvolvePoint: string;
    RegistsPointIndexs: number[];
    StationType: number;
    LsrMode: number;
    Speed: number;
    Bay: string;
    Graph: {
        Display: string;
        X: number;
        Y: number;
        ImageName: string;
        ImageScale: number;
        ImageSize: [number, number];
        IsBezierCurvePoint: boolean;
        BezierCurveID: string;
        textOffsetX: number;
        textOffsetY: number;
        rackDisplay: {
            Rotation: number;
            OffsetX: number;
            OffsetY: number;
        };
    };
    Target: { [key: string]: number };
    DodgeMode: number;
    SpinMode: number;
    SubMap: string;
    AutoDoor: {
        KeyName: string;
        KeyPassword: string;
    };
    MotionInfo: {
        ControlBypass: {
            GroundHoleCCD: string;
            GroundHoleSensor: string;
            UltrasonicSensor: string;
        };
    };
    TagOfInPoint: number;
    TagOfOutPoint: number;
    Region: string;
    PriorityOfTask: number;
    IsHighestPriorityStation: boolean;
}

interface Segment {
    StartPtIndex: number;
    EndPtIndex: number;
    StartCoordination: [number, number];
    EndCoordination: [number, number];
    PathID: string;
}

interface MapOptions {
    pathColor: string;
    normalStationTextColor: string;
    workStationTextColor: string;
    normalStationTextFontSize: number;
    workStationTextFontSize: number;
    fontSizeOfDisplayName: number;
    fontSizeOfAsCandicates: number;
    Rotation: number;
    EQIcons: string[];
    gridSize: number;
    gridOffsetX: number;
    gridOffsetY: number;
    defaultShowBackgroudImage: boolean;
}

interface MapData {
    Version: number;
    Options: MapOptions;
    Name: string;
    ImageName: string;
    Note: string;
    PointIndex: number;
    Map_Image_Size: [number, number];
    Map_Image_Boundary: [number, number, number, number];
    Points: { [key: string]: Point };
    Segments: Segment[];
}

export interface MapModel {
    Map: MapData;
}

export const defaultMapModel: MapModel = {
    Map: {
        Version: 0,
        Options: {
            pathColor: '',
            normalStationTextColor: '',
            workStationTextColor: '',
            normalStationTextFontSize: 0,
            workStationTextFontSize: 0,
            fontSizeOfDisplayName: 0,
            fontSizeOfAsCandicates: 0,
            Rotation: 0,
            EQIcons: [],
            gridSize: 0,
            gridOffsetX: 0,
            gridOffsetY: 0,
            defaultShowBackgroudImage: false
        },
        Name: '',
        ImageName: '',
        Note: '',
        PointIndex: 0,
        Map_Image_Size: [0, 0],
        Map_Image_Boundary: [0, 0, 0, 0],
        Points: {},
        Segments: []
    }
};

export default defaultMapModel;
