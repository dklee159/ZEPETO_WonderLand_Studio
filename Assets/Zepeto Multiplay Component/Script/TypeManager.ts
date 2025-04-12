import { TextMeshProUGUI } from "TMPro";
import { Animator, BoxCollider, Camera, Coroutine, GameObject, HumanBodyBones, ParticleSystem, Transform, Vector3 } from "UnityEngine";
import { Image, Slider, Text } from "UnityEngine.UI";

export default class TypeManager {
}

/*** Http Data Connection Service ***/
export enum HttpData {
    GET = "GET",
    POST = "POST",
    GET_URL = "https://bkol779o38.execute-api.ap-northeast-2.amazonaws.com/WonderLandAPI/userdata/",
    POST_URL = "https://bkol779o38.execute-api.ap-northeast-2.amazonaws.com/WonderLandAPI/userdata",
    Data_Version = "1.1.0",
}

export interface PlayerDB {
    userId: string,
    zepetoId : string,
    wonderCoin: number,
    wonderItems: WonderItem[],
    wonderCollection: WonderCollection[],
    dailyQuest : WonderQuest_Daily,
    weeklyQuest : WonderQuest_Weekly,
    monthlyQuest : WonderQuest_Monthly,
    wonderDraw: WonderDraw[],
    attend: Attend,
    version: string,
    isHSManager: boolean,
    SDCharacter : SD[],
    nextMonday: string,
    lastVisit: number,
    totalVisit: number,
    entryTicketAmount: number,
    entryTicket: EntryTicket
}

export interface EntryTicket {
    wonderland: boolean,
    stage: boolean,
    studio: boolean,
    awards: boolean,
}

export enum SDName {
    Siwoo = 0,
    Yubin = 1,
    Gabin = 2,
    Jia = 3,
    Hajun = 4,
}

export interface SD {
    Index : number,
    Has : boolean,
    Equip : boolean,
}

export enum WonderDrawList {
    K = "K",
    Won = "Won",
    Der = "Der",
    Land = "Land"
}

export interface WonderDraw {
    id: string,
    amount: number
}

export interface QuestInfo_VisitCount extends QuestInfo {
    Visit_Wonder : number,
    Visit_Studio : number,
    Visit_Stage : number,
    Visit_Count : number
}

export interface QuestInfo {
    Index : number,
    Name : string,
    CoinAmount : number,
    QuestAmount : number,
    QuestAcceptAmount : number,
    IsSuccess : boolean,
}

export interface WonderQuest_Daily {
    Visit_wonderland : QuestInfo,
    Visit_stage : QuestInfo,
    Visit_studio : QuestInfo,
    PlayGame_wonderland : QuestInfo,
    PlayGame_stage : QuestInfo,
    PlayGame_studio : QuestInfo,
    PostFeed_1 : QuestInfo,
}

export interface WonderQuest_Weekly {
    Visit_world_3 : QuestInfo_VisitCount,
    HangangRace_777 : QuestInfo,
    DailyQuest_3 : QuestInfo,
    Visit_continuous_3 : QuestInfo,
    Visit_continuous_5 : QuestInfo,
    PlayGame_10 : QuestInfo,
    PostFeed_3 : QuestInfo,
}

export interface WonderQuest_Monthly {
    Visit_world_ten : QuestInfo_VisitCount,
    Move_wonderAwards : QuestInfo,
    Visit_continous_7 : QuestInfo,
    WeeklyQuest_2 : QuestInfo,
    GatherCoin_5000 : QuestInfo,
    PlayGame_30 : QuestInfo,
    PostFeed_10 : QuestInfo,
}

export enum QuestMenu {
    Daily = "dailyQuest",
    Weekly = "weeklyQuest",
    Monthly = "monthlyQuest"
}

export enum WorldId {
    WorldId_Land = "com.kofice.kwonderland",
    WorldId_Stage = "com.kofice.kwonderlandpop",
    WorldId_Studio = "com.kofice.kwonderdrama",
    WorldId_Awards = "com.kofice.kwonderawards",
}

/* Server Connect Message */
export enum MESSAGE {
    /*** Http Data Connection Service ***/
    HTTP = "HTTP",
    PlayerDB = "PlayerDB",


    SyncPlayer = "SyncPlayer",
    ChairSit = "ChairSit",
    ChairSitDown = "ChairSitDown",
    ChairSitUp = "ChairSitUp",
    Equip = "Equip",
    EquipChange = "EquipChange",
    Unequip = "Unequip",
    SyncObjectAnimation = "SyncObjectAnimation",
    LOG = "Log",
    Visible = "Visible",
    Leaderboard_Update = "Leaderboard_Update",
    Effect = "Effect",

    /** Wonder **/
    /* Wonder Zone */
    AddBadge = "AddBadge",
    MissionClear = "MissionClear",
    MissionAllClear = "MissionAllClear",
    SetWonder = "SetWonder",
    State_OFF = "State_OFF",
    TeleportZone = "TeleportZone",
    Picnic = "Picnic",
    PhotoPose = "PhotoPose",
    Balloon_Play = "Balloon_Play",
    Balloon_Ride = "Balloon_Ride",
    Balloon_Ride_OFF = "Balloon_Ride_OFF",
    Bumper_Play = "Bumper_Play",
    Bumper_Ride = "Bumper_Ride",
    Bumper_Ride_OFF = "Bumper_Ride_OFF",
    Play_GameZone = "Play_GameZone",
    Play_Score = "Play_Score",

    CheckServerTimeRequest = "CheckServerTimeRequest",
    CheckServerTimeResponse = "CheckServerTimeResponse",
    CheckMaster = "CheckMaster",
    MasterResponse = "MasterResponse",
    RequestInstantiateCache = "RequestInstantiateCache",
    Instantiate = "Instantiate",
    PauseUser = "PauseUser",
    UnPauseUser = "UnPauseUser",
    SyncTransformStatus = "SyncTransformStatus",

    FoodEquipp = "Message_Food_Equipp",
    FoodUnequipp = "Message_Food_Unequipp",
    Busking = "Busking",
    BuskingHeart = "BuskingHeart",
    Ranking = "Ranking",

    PlayerSync = "PlayerSync",

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

/* Server Connect Messages Room Datas Name */
export enum SendName {
    /*** Http Data Connection Service ***/
    METHOD = "METHOD",
    URL = "URL",
    DATA = "DATA",


    // Default
    isSit = "isSit",
    chairId = "chairId",
    gestureName = "gestureName",
    animationParam = "animationParam",
    cliplength = "cliplength",
    playerAdditionalValue = "playerAdditionalValue",
    id = "id",
    Name = "Name",
    Attach = "Attach",

    /** Wonder **/
    /* Wonder Zone */
    Count = "Count",
    WonderState = "WonderState",
    MESSAGE = "MESSAGE",
    Multiplay = "Multiplay",
    CurrentZone = "CurrentZone",
    ZoneType = "ZoneType",
    Type = "Type",
    BumperCarType = "BumperCarType",
    BumperTargets = "BumperTargets",
    isPlay = "isPlay",
    isRide = "isRide",
    Wait = "Wait",

    /* Horror Zone */
    isHasPoint = "isHasPoint",

    /* WonderHall Zone */
    isJG = "isJG",
    JG_Id = "JG_Id",

    FoodType = "FoodType",
    SessionId = "SessionId",
}

/* Player Speed Datas Name */
export enum PlayerMove {
    additionalWalkSpeed = "additionalWalkSpeed",
    additionalRunSpeed = "additionalRunSpeed",
    additionalJumpPower = "additionalJumpPower",
}

export interface EquipData {
    key: string;
    sessionId: string;
    itemName: string;
    prevItemName: string;
    bone: number;
    prevBone: number;
    wonderState: number;
}

export enum EquipList {
    AnimMike = 0,
    AwardsMike_1 = 1,
    AwardsMike_2 = 2,
    AwardsHead = 10,
    AwardsNeck_1 = 100,
    AwardsNeck_2 = 101,
}

/** Wonderland **/
/* Wonder State Data */
export enum WonderState {
    NONE = 0,
    Ride_Slide = 20,
    Hold_RightHand_Upper = 51, Hold_RightHand_Side = 52,

    Swim = 70,

    /** Wonder **/
    /* Wonder Zone */

    // Picnic
    Picnic_Eat = 101, Picnic_LayDown = 102, Picnic_LayDown_Photo = 103,
    Photo_Pose_1_Sit = 111, Photo_Pose_2_Sit = 112, Photo_Pose_3_Sit = 113,
    Photo_Pose_1 = 114, Photo_Pose_2 = 115, Photo_Pose_3 = 116,

    // Panel Button
    Panel_Pose_1 = 131, Panel_Pose_2 = 132, Panel_Pose_3 = 133,
    Panel_LOCK_Pose_1 = 134, Panel_LOCK_Pose_2 = 135, Panel_LOCK_Pose_3 = 136,

    Bumper_Ride = 201,
    Balloon_Ride = 250,
    PlayGame = 280,

    /* Horror Zone */
    H_Damaged = 310, H_Attack = 320, H_Death = 390,

    //WILL wonderhall minigame
    HM_hurray = 410, HM_JG = 420, HM_NT = 430,
    News_Sit = 490, News_Sit_Default = 491, News_Sit_Watch = 492, News_Sit_Hi = 493, News_Report = 499,


    /* Wonder Stage */
    Pose_Dance = 2001, Pose_Camera = 2002, Pose_Walking = 2003, Pose_Piano = 2004, Pose_Chair = 2008,
    Pose_Dress_HairBrush = 2011, Pose_Dress_HairComb = 2012, Pose_Dress_Hairspray = 2013,
    Pose_Dress_MakeBlush = 2021, Pose_Dress_MakeEyebow = 2022, Pose_Dress_MakeLip = 2023,
    Pose_Runway = 2100, Pose_Runway_001 = 2101, Pose_Runway_002 = 2102, Pose_Runway_003 = 2103,
}



//////////////////////////////////////////////// About Game Manager

/* Sprite World Button */
export enum ButtonType {
    NULL = -1,
    Chair = 0, UIActivate = 10,
    EquipHead = 21, EquipRightHand = 22, EquipLeftHand = 23, EquipBody = 24,

    /** Wonder **/
    /* Wonder Zone */
    FoodTruck_A = 51, FoodTruck_B = 52, FoodTruck_C = 53, FoodTruck_D = 54,
    Picnic_Eat_1 = 61, Picnic_Eat_2 = 62, Picnic_Down = 63, Picnic_Down_Photo = 64,
    Photo_Pose_1_Sit = 71, Photo_Pose_2_Sit = 72, Photo_Pose_3_Sit = 73,
    Photo_Pose_1 = 74, Photo_Pose_2 = 75, Photo_Pose_3 = 76,
    //
    Ride_Bumper = 201,

    PlayGameMachine = 301,

    Ticket_Balloon = 401, Ticket_Bumper = 402, Ticket_Horror = 403, Ticket_Play = 404,

    /* WonderHall Zone */
    News_Sit_Default = 491, News_Report = 499,
    Hall_JG = 711,   // 미니게임 제기차기
    Hall_NT = 721,   // 미니게임 제기차기


    /* Wonder Stage */
    Pose_Dance = 2001, Pose_Camera = 2002, Pose_Walking = 2003, Pose_Piano = 2004, Pose_Chair = 2008,
    Pose_Dress_HairRandom = 2010, Pose_Dress_HairBrush = 2011, Pose_Dress_HairComb = 2012, Pose_Dress_Hairspray = 2013,
    Pose_Dress_MakeRandom = 2020, Pose_Dress_MakeBlush = 2021, Pose_Dress_MakeEyebow = 2022, Pose_Dress_MakeLip = 2023,

}

/* Camera Mode Data */
export enum CameraMode {
    FPS, TPS,
}

/* Camera */
export interface CameraOffset {
    offset: Vector3,
    maxZoomDistance: number,
    minZoomDistance: number,
}

/* Camera Mode Data */
export enum EffectType {
    NONE = -1,
    Firework = 1,
    Runway = 2000,
}

/* Object Animation Sync */
export interface SyncAnim {
    currentProgress:number;
}

/* Zones */
export enum ZoneType {
    NULL = -1,
    Main = 10, Main_Hall = 11,
    BumperZone = 20, ParkZone = 30, BalloonZone = 40, PlayZone = 50,
    HorrorZone = 70, HorrorZone_Game = 80,
    WonderHallZone = 110,
    WonderHallZone_VR = 120,
    WonderHallZone_Game_JG = 150,
    WonderHallZone_Game_NT = 160,
}

/* Zones */
export enum MultiplayType {
    Multiplay, Local,
}


//////////////////////////////////////////////// About UI Manager

/* Loading UI Data */
export enum LoadingType {
    Start = "UI_Loarding_Start",
    Teleport = "UI_Loarding_Teleport",
    Fade_Horror = "UI_Fade_Horror",
    NONE = "",
}

export enum Language {
    EN, KR
}



//////////////////////////////////////////////// Wonderland

/* Inventory */
export enum MissionType {
    NONE = "",
    JG = "JG", NT = "NT",
    Stage = "Stage", Runway = "Runway",
}

export enum WonderItemList {
    TICKET_HORROR = "TICKET_HORROR",
    TICKET_BALLOON = "TICKET_BALLOON",
    TICKET_BUMPER = "TICKET_BUMPER",
    TICKET_PLAY = "TICKET_PLAY",
}

export enum WonderCollectionList {
    // Badge 3
    Wonder_Badge_Hall = "Wonder_Badge_Hall",
    Wonder_Badge_Stage = "Wonder_Badge_Stage",
    Wonder_Badge_Studio = "Wonder_Badge_Studio",
    
    // Award Hidden
    Hiddle_Collection = "Hiddle_Collection",
}

export enum WonderCollectList {
    STAMP_A = "STAMP_A",
    STAMP_B = "STAMP_B",
    STAMP_C = "STAMP_C",
    STAMP_D = "STAMP_D",
}
export interface WonderItem {
    id:string,
    count:number,
}
export interface WonderCollection {
    id:string,
    has:boolean,
}
export interface Attend {
    lastDate: string,
    count: number,
}
export interface WonderCollectionUI {
    gameObject:GameObject;
    transform:Transform;
    text:Text,
    item:WonderCollection;
}

export interface TicketUI {
    count: number,
    titleText: TextMeshProUGUI,
    countText_Coin: TextMeshProUGUI,
    countText_Ticket: TextMeshProUGUI,

    titleText_Success: TextMeshProUGUI,
    countText_Ticket_Success: TextMeshProUGUI,
}

/* NPC List */
export enum NPCs {
    GABIN, YUBIN, HAJUN, JIA, SIWOO, Special,
}
export enum NPCType {
    Default,
    HelloNPC, NewsNPC, DanceNPC, Hall_InfoNPC, PortalNPC, MiniGameNPC,
}

export enum NPC_ID {
    GABIN = "wonderland.gabin",
    YUBIN = "wonderland.yubin",
    HAJUN = "wonderland.hajun",
    JIA = "wonderland.jia",
    SIWOO = "kor_wonderland",
    Special = "kwonderstarjojo",

    // NPC Data
    _NOT_USERD_GABIN = "wonderland_gabin",
    _NOT_USERD_HAJUN = "wonderland_hajun",
    _NOT_USERD_JIA = "wonderland_jia",
    _NOT_USERD_SIWOO_v1 = "wonderland.Siwoo",
    _NOT_USERD_SIWOO_v2 = "wonderland_Siwoo",
}

export interface AttendPanel {
    gameObject: GameObject,
    transform: Transform,
    highlight: GameObject,
    lock: GameObject,
    index: number,
}

export enum UnequipButtonType {
    NONE = -1,
    Hold_RightHand_Upper = 51, Hold_RightHand_Side = 52,
}

export enum FoodList {
    // Food A
    Food_A_Tokkpokki = "Food_A-1 Tokkpokki",
    Food_A_Odeng = "Food_A-2 Odeng",

    // Food B
    Food_B_Jjigae = "Food_B-1 Jjigae",
    Food_B_Bibimbab = "Food_B-2 Bibimbab",
    
    // Food C
    Food_C_Shike = "Food_C-1 Shike",
    Food_C_Sujunggwa = "Food_C-2 Sujunggwa",

    // Food D
    Food_D_Yakkwa = "Food_D-1 Yakkwa",
    Food_D_Hangwa = "Food_D-2 Hangwa",
}

export interface RenderPlayGameTarget {
    transform: Transform,
    gameObject: GameObject,
    animator: Animator,
}

export enum TriggerType {
    NONE = -1,
    UnEquip = 30,
    BalloonPhotoCam = 50,
    Water = 70,

    TicketBooth_Balloon = 401, TicketBooth_Bumper = 402, TicketBooth_Horror = 403, TicketBooth_Play = 404,

    UIActivate_Once = 2010,
    UIActivate = 2020,
    WorldTeleport_Land = 10000,
    WorldTeleport_Stage = 10100,
    WorldTeleport_Studio = 10200,
    WorldTeleport_Awards = 10300,
    Collider = 10400,
    Update = 15000,
    Button = 10600,
}

export enum TimeTriggerType {
    Start, Finish,
}

export enum HorrorTriggerType {
    NONE = -1,
    Start = 0, Ghost = 10, Item = 20, Teleport = 40, Finish = 50,
}

export enum HorrorItemType {
    Lamp = "Lamp", Fire = "Fire",
}

export enum TimerData {
    Start, Pause, Stop, Reset,
}

/* LeaderBoard Datas */
export enum RankData {
    /* LeaderBoard Id */
    // HorrorZoneTimeId = "7e77bf91-28d4-4ff5-9e74-87d7cc08fc0c",
    // BumperZoneScoreId = "bf9adc91-1983-423b-9ae3-9135763d256b",
    // PlayZoneScoreId = "89f6994a-0fec-4cda-9a56-f161f7408783",

    HorrorZoneTimeId_WEEK = "7e77bf91-28d4-4ff5-9e74-87d7cc08fc0c",
    BumperZoneScoreId_WEEK = "bf9adc91-1983-423b-9ae3-9135763d256b",
    PlayZoneScoreId_WEEK = "89f6994a-0fec-4cda-9a56-f161f7408783",
    NT_Id_WEEK = "15ca03d4-bce6-4042-b48b-297dfe681ff4",
    JG_Id_WEEK = "0889d68b-eeb0-4dc7-89c2-b18a31f472f2",
    
    HorrorZoneTimeId = "37d71d9d-1f28-4e78-9818-4f6ae178d038",
    BumperZoneScoreId = "c4eba8fa-fb5b-4505-80c6-d3b5946ceb8b",
    PlayZoneScoreId = "121c8253-aa39-4e92-ba77-ad751c3d924f",
    NT_Id = "774e84c9-96cd-43dc-9fd1-66b41a0bb8fc",
    JG_Id = "0bcecb95-18f2-467c-bbce-97e3d82777e3",
    
    // Select Update
    BumperZone = 200,
    HorrorZone = 300,
    PlayZone = 400,
    NT_Zone = 1100,
    JG_Zone = 1200,

    StageZone = 2100,
    RunwayZone = 2200,
    
    /* Recycle Datas */
    Rank_Start = 1,
    Rank_End = 10,
    Empty = "",
    Zero = "0",
    Empty_Line = "------",
    Zero_Time = "00:00:00",
}

export interface RankUI {
    panel:GameObject,
    rank:number,
    text_Id:TextMeshProUGUI,
    text_Score:TextMeshProUGUI,
    profile:Image,
}

export enum BalloonCamType {
    FPS = 0, AirCam = 1, Default = 2,
}

export enum BumperCarType {
    NONE = -1, Yellow = 0, Green = 1, Red = 2, Blue = 3,
}

export enum JoystickType {
    NONE = -1, ToRight, ToLeft, ToBack, ToFront,
}

export interface AxisData {
    accel:number,
    currentSpeed:number,
}

export interface RotationData {
    accel:number,
    accelator:number,
    currentEuler:number,
}

export interface HandlingData {
    speed:number,
    currentEuler:number,
    angleToFront:number,
}

export enum SizeType {
    Large = 1,
    Middle = 5,
    Small = 10,
}

export enum PlayItemConditions {
    Item_Time = 1000,
    Item_Star = 3000,
}

export interface PositionBox {
    x_min: number, x_max: number,
    y_min: number, y_max: number,
    z_min: number, z_max: number,
}

export interface PlayMachineResultPanel {
    slider: Slider,
    scoreText: TextMeshProUGUI,
    scoreText_Total: TextMeshProUGUI,
    scoreText_Static: TextMeshProUGUI,
    item_TIME: GameObject,
    item_STAR: GameObject,
    LOCK: GameObject,
}


//////////////////////////////////////////////// Others

/* Other String Datas Collection */
export enum Datas {
    // Names
    Cake = "Cake",
    Balloon = "Balloon",
    Balloon_A = "Balloon_A",
    Balloon_B = "Balloon_B",
    Balloon_C = "Balloon_C",

    // World Id
    WorldId_Land = "com.kofice.kwonderland",
    WorldId_Stage = "com.kofice.kwonderlandpop",
    WorldId_Studio = "com.kofice.kwonderdrama",
    WorldId_Awards = "com.kofice.kwonderawards",

    // Transform Point
    SpawnPoint = "SpawnPoint",
    TeleportPoint = "TeleportPoint",

    // Layer
    Button = "Button",              // LAYER 6
    Render_Frame = "Render Frame",  // LAYER 7
    Render_Item = "Render Item",    // LAYER 8

    // Game Message
    READY = "READY",
    START = "START!",
    FINISH = "FINISH",
    TIME_UP = "TIME'S UP!",
    CLEAR = "GAME CLEAR!",
    GAME_OVER = "GAME OVER",
    Successed = "Successed",
    Failed = "Failed",

    // Picture
    FeedMessage = "#K-WONDERLAND #WHATEVERYOUDREAM",

    // others
    Zero = "0",
    One = "1",
    NULL = "null",
    Empty = "",

}

/* Tags */
export enum Tags {
    SpawnPoint = "SpawnPoint", 
    LocalPlayer = "LocalPlayer",
    Player = "Player",
    Trigger = "Trigger", 
    Weapon = "Weapon",
    Loading = "Loading", 
    BumperCar = "BumperCar", 
    ShootTarget = 'ShootTarget',
    ShootSource = 'ShootSource',
}

/* Animation Clip Name Datas */
export enum Anim {
    State = "State",
    WonderState = "WonderState",
    MoveState = "MoveState",
    JumpState = "JumpState",
    LandingState = "LandingState",
    MotionSpeed = "MotionSpeed",
    FallSpeed = "FallSpeed",
    Acceleration = "Acceleration",
    MoveProgress = "MoveProgress",
    isSit = "isSit",
    isHold = "isHold",
    
    // Wonder
    Play = "Play",
    Active = "Active",
    AnimationSpeed = "AnimationSpeed",
    PhotoPose = "PhotoPose",

    // NPC Animation
    isNPC = "isNPC",
    isReport = "isReport",

}

/* Chair Sit Datas */
export interface SyncChair {
    chairId: string,
    OwnerSessionId: string,
    onOff: boolean,
}

/* Default ScreenShot Render Result Toast Data */
export enum TOAST_MESSAGE {
    feedUploading = "Uploading...",
    feedCompleted = "Done",
    feedFailed = "Failed",
    screenShotSaveCompleted = "Saved!"
}

/* Default ScreenShot Render Result Layer Data */
export enum LAYER {
    everything = -1,
    nothing = 0,
    UI = 5,

    Button = 6,
    Render_Frame = 7,
    Render_Item = 8,
    Wall = 10,
    NPC = 20,
    Player = 21,
}

/* Console Error */
export enum ERROR {
    NOT_ENOUGH = "NOT ENOUGH....",
    NOT_MATCHED = "NOT MATCHED....",
    ALREADY_OPENED = "ALREADY OPENED....",
    NOT_FOUND_ITEM = "NOT FOUND ITEM........",
    ITS_FULL_PLAYERS = "IT'S FULL PLAYERS....",
    NOT_SELECTED_TYPE = "NOT SELECTED TYPE....",
    NOT_FOUND_PLAYER = "NOT FOUND PLAYER........",
    ROOM_DISCONNECTION = "ROOM DISCONNECTION......",
    NOT_FOUND_LOCAL_PLAYER = "NOT FOUND LOCAL PLAYER....",
    MINI_GAME_MANAGER_OVERLAPED = "MINI GAME MANAGER OVERLAPED......",
    NOT_FOUND_ZEPETO_ID_FROM_USER_ID = "NOT FOUND ZEPETO ID FROM USER ID........",


    TRANSLATE_NOT_FOUND = "Please, Attached component of text type!",
}