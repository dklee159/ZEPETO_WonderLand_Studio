import { SandboxPlayer } from "ZEPETO.Multiplay";
import Server from "..";

export abstract class IModule {
    private readonly _server: Server;
    protected get server(): Server { return this._server; }
    constructor(server: Server) {
        this._server = server;
    }
    abstract OnCreate(): Promise<void>;
    abstract OnJoin(client: SandboxPlayer): Promise<void>;
    abstract OnLeave(client: SandboxPlayer): Promise<void>;
    abstract OnTick(deltaTime: number): void;
}

export enum HttpData {
    GET = 'GET',
    POST = 'POST',
    GET_URL = "https://bkol779o38.execute-api.ap-northeast-2.amazonaws.com/WonderLandAPI/userdata/",
    POST_URL = "https://bkol779o38.execute-api.ap-northeast-2.amazonaws.com/WonderLandAPI/userdata",
    Data_Version = "0.8.0",
}
/** racing game **/
// interface GameReport{
//     playerUserId : string;
//     playerLapTime : number;
// }

export enum MESSAGE {
    PlayerDB = "PlayerDB",
    SyncPlayer = "SyncPlayer",
    SyncTransform = "SyncTransform",
    SyncTransformStatus = "SyncTransformStatus",
    SyncAnimator = "SyncAnimator",
    ResponseAnimator = "ResponseAnimator",
    ChangeOwner = "ChangeOwner",
    Instantiate = "Instantiate",
    RequestInstantiateCache = "RequestInstantiateCache",
    ResponsePosition = "ResponsePosition",
    SyncDOTween = "SyncDOTween",
    CheckServerTimeRequest = "CheckServerTimeRequest",
    CheckServerTimeResponse = "CheckServerTimeResponse",
    CheckMaster = "CheckMaster",
    MasterResponse = "MasterResponse",
    PauseUser = "PauseUser",
    UnPauseUser = "UnPauseUser",

    HTTP = 'HTTP',
    FoodEquipp = "Message_Food_Equipp",
    FoodUnequipp = "Message_Food_Unequipp",
    Busking = "Busking",
    BuskingHeart = "BuskingHeart",

    /** Sample Code **/
    BlockEnter = "BlockEnter",
    BlockExit = "BlockExit",
    SendBlockEnterCache = "SendBlockEnterCache",
    CoinAcquired = "CoinAcquired",

    /** Racing Game **/
    StartRunningRequest = "StartRunningRequest",
    FinishPlayer = "FinishPlayer",
    FirstPlayerGetIn = "FirstPlayerGetIn",
    CountDownStart = "CountDownStart",
    ResponseGameReport = "ResponseGameReport",

    ChairSit = "ChairSit",

    PlayerSync = "PlayerSync",

    AddBadge = 'AddBadge',
    MissionClear = 'MissionClear',
    MissionAllClear = 'MissionAllClear',
    SetWonder = 'SetWonder',
    BuyItem = 'BuyItem',
    UseTicket = 'UseTicket',
    State_OFF = 'State_OFF',
    TeleportZone = 'TeleportZone',
    Coin = 'Coin',
    Picnic = 'Picnic',
    PhotoPose = 'PhotoPose',
    Runway_Play = 'Runway_Play',
    Pose = 'Pose',

    // SD
    InstantiatedSD = "InstantiatedSD",
    EquipSD = "EquipSD",
    UnequipSD = "UnequipSD",
    VisibleSD = "VisibleSD",
    InvisibleSD = "InvisibleSD",

    // Equip
    InstantiatedEquip = "InstantiatedEquip",
    EquipItem = "EquipItem",
    UnequipItem = "UnequipItem",
    VisibleItem = "VisibleItem",
    InvisibleItem = "InvisibleItem"
}

export interface PlayerEquip {
    Head : Equip,
    RightHand : Equip,
    Neck : Equip,
}

export interface Equip {
    Index : number,
    IsEquip : boolean,
}

export interface WorldData {
    missionClear_Badge: boolean;
    // playScore: number,
    // MissionClear_JG: boolean,
    // MissionClear_NT: boolean,
    // MissionClear_Badge: boolean,
}