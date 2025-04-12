import {
    Coroutine,
    Transform,
    GameObject,
    WaitForSeconds,
    Vector2,
    Mathf,
    AudioListener,
    Sprite,
    Vector3,
    Random,
} from "UnityEngine";
import { Image } from "UnityEngine.UI";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import {
    ZepetoPlayers,
    UIZepetoPlayerControl,
} from "ZEPETO.Character.Controller";
import ToastController from "./Controllers/ToastController";
import AnimationManager, { WonderState } from "./Manager/AnimationManager";
import FoodManager from "./Manager/FoodManager";
import MultiplayManager from "../ZepetoScript/Common/MultiplayManager";
import BuskingZoneManager from "./Manager/BuskingZoneManager";
import {
    HttpData,
    MESSAGE,
    PlayerDB,
    SendName,
    WonderCollectionList,
    MissionType,
    WorldId
} from "./TypeManager";
import UIManager from "./Manager/UIManager";
import { Room, RoomData } from "ZEPETO.Multiplay";
import {
    WorldService,
    ZepetoWorldMultiplay,
    ZepetoWorldHelper,
    ZepetoWorldContent,
} from "ZEPETO.World";
import HttpDataConnectionService from "./HttpDataConnectionService";
import AttendController from "./AttendController";
import TransformSyncHelper from "../ZepetoScript/Transform/TransformSyncHelper";
import QuestManager from "./Manager/QuestManager";
import QuizGameManager from "./MiniGames/QuizGame/QuizGameManager";
import SyncIndexManager from "../ZepetoScript/Common/SyncIndexManager";
import InteractionController from "./Interaction/InteractionController";
import SDManager from "./Manager/SDManager";
import EquipManager from "./Manager/EquipManager";

export type CallbackWorldPortal = () => void;
export default class GameManager extends ZepetoScriptBehaviour {
    /* Singleton */
    private static _instance: GameManager;
    public static get instance(): GameManager {
        if (!GameManager._instance) {
            const managerObj = GameObject.Find("GameManager");
            if (managerObj)
                GameManager._instance = managerObj.GetComponent<GameManager>();
        }
        return GameManager._instance;
    }

    public zepetoId: string;

    private _playerDB: PlayerDB;
    private _isGetPlayerDB: boolean = false;

    public get playerDB(): PlayerDB {
        return this._playerDB;
    }
    public get isGetPlayerDB(): boolean {
        return this._isGetPlayerDB;
    }

    private set playerDB(value: PlayerDB) {
        if (!value || this._playerDB) return;
        this._playerDB = value;
    }
    private set isGetPlayerDB(value: boolean) {
        this._isGetPlayerDB = value;
    }

    /* Manager */
    @HideInInspector()
    public m_MultiplayManager: MultiplayManager;

    @Header("Managers")
    @SerializeField()
    private _foodManager: GameObject;
    @SerializeField() private _toastController: GameObject;
    @SerializeField() private _buskingZoneManager: GameObject;
    @SerializeField() private _attendController: GameObject;

    @SerializeField() private _InteractionController: GameObject[] = [];

    private foodManager: FoodManager;
    private toastController: ToastController;
    private buskingZoneManager: BuskingZoneManager;
    private attendController: AttendController;

    /* Variables */
    private poseCoroutine: Coroutine;
    private room: Room;
    private multiplay: ZepetoWorldMultiplay;
    private joyCon: UIZepetoPlayerControl;

    public loadingSprite: Sprite[] = [];
    Awake() {
        GameManager._instance = this;
        GameObject.DontDestroyOnLoad(this.gameObject);
    }

    private loadingUI: GameObject;

    /* event */
    @SerializeField() private hideAndSeek: GameObject[] = [];

    Start() {
        ZepetoWorldHelper.GetUserIdInfo(
            [WorldService.userId],
            (users) => {
                this.zepetoId = users[0].zepetoId;
            },
            (err) => {}
        );

        if (!this.multiplay)
            this.multiplay =
                GameObject.FindObjectOfType<ZepetoWorldMultiplay>();
        UIManager.instance.SetDefaultButton(false);
        UIManager.instance.SetDefaultPlayerController(false);
        this.loadingUI = UIManager.instance.GetLoadingImage();
        if (!this.loadingUI) return;

        this.loadingUI.SetActive(true);

        this.StartCoroutine(this.LoadingImage());

        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;

            this.room.AddMessageHandler(MESSAGE.HTTP, (message: any) => {
                if (message.type == HttpData.GET) {
                    if (message.hasData) {
                        console.log(`YES DATA`);
                        this.SetPlayerData(message.body as PlayerDB);
                    } else {
                        console.log(`NO DATA`);
                        this.SendRequest_POST();
                    }
                    // } else if(message.type == HttpData.POST) {
                }
            });

            this.StartCoroutine(this.StartLoading());
        };
        this.m_MultiplayManager = MultiplayManager.instance;
        this.foodManager = this._foodManager.GetComponent<FoodManager>();
        this.toastController =
            this._toastController.GetComponent<ToastController>();
        this.buskingZoneManager =
            this._buskingZoneManager.GetComponent<BuskingZoneManager>();
        this.attendController =
            this._attendController.GetComponent<AttendController>();

        this.attendController.RemoteStart();
    }

    private *LoadingImage() {
        const wait = new WaitForSeconds(1);
        while (this.loadingUI.activeInHierarchy) {
            this.loadingUI.GetComponent<Image>().sprite = this.loadingSprite[0];
            yield wait;
            this.loadingUI.GetComponent<Image>().sprite = this.loadingSprite[1];
            yield wait;
        }
    }

    private *StartLoading() {
        let isLoading = true;
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();

        // ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
        //     this.StartCoroutine(this.HideAndSeekEvent());
        // });

        const wait = new WaitForSeconds(1);
        console.log(`Im Starting !!! 4`);

        /* Request Data */
        while (true) {
            yield null;
            if (this.room != null) {
                console.log(`this.room.IsConnected ${this.room.IsConnected}`);
            }
            if (this.room != null && this.room.IsConnected) {
                this.SendRequest_GET(); // Get Data
                break;
            }
        }
        console.log(` Request Data !!!  5`);

        /* Recieve Data */
        while (true) {
            yield null;
            if (this.isGetPlayerDB) break;
        }
        console.log(` Recieve Data !!!  6`);
        /* Manager Remote Start */
        while (isLoading) {
            yield wait;
            if (this.room != null && this.room.IsConnected) {
                console.log(
                    `[GameManager] Try to loading..... HasPlayer ${
                        this.room.SessionId
                    } ${ZepetoPlayers.instance.HasPlayer(this.room.SessionId)} `
                );
                if (ZepetoPlayers.instance.HasPlayer(this.room.SessionId)) {
                    console.log(` isLoading !!!!!!!!!! 0 `);
                    this.CheckVisit();
                    /* Remote Start */
                    console.log(`[GameManager] UIManager loaded try`);
                    UIManager.instance.RemoteStart();
                    console.log(`[GameManager] UIManager loaded success`);

                    for (const controller of this._InteractionController) {
                        controller
                            .GetComponent<InteractionController>()
                            .RemoteStart();
                    }
                    console.log(
                        `[GameManager] InteractionController loaded success`
                    );

                    QuestManager.Instance.InitData(this.playerDB);
                    /* PlayerDB */
                    this.attendController.UpdateAttendData(
                        this.playerDB.attend
                    );
                    const loadingUI = UIManager.instance.GetLoadingImage();

                    /* Stop Loading */
                    console.log(` isLoading !!!!!!!!!! 1 ${isLoading} `);
                    isLoading = false;
                    console.log(` isLoading !!!!!!!!!! 2 ${loadingUI} `);
                    console.log(` isLoading !!!!!!!!!! 3 `);
                    ZepetoPlayers.instance.controllerData.inputAsset.Enable();
                    console.log(` isLoading !!!!!!!!!! 4 `);
                    console.log(` isLoading !!!!!!!!!! 5 `);
                    UIManager.instance.UpdateCoinUI();
                    UIManager.instance.SetDefaultButton(true);
                    UIManager.instance.SetDefaultPlayerController(true);

                    // 카메라 위치 조정
                    ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.Rotate(
                        0,
                        180,
                        0
                    );
                    ZepetoPlayers.instance.LocalPlayer.zepetoCamera.Rotate(
                        new Vector2(0, 0.006)
                    );

                    
                    SDManager.instance.Init(this.playerDB);
                    EquipManager.instance.InitEquipData();

                    this.StartCoroutine(this.HideAndSeekEvent());
                    yield wait;
                    // ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera.transform.parent.localPosition -= new Vector3(0, 0, 20);
                    this.StopCoroutine(this.StartLoading());
                    this.StopCoroutine(this.LoadingImage());
                    loadingUI.SetActive(false);
                    break;
                }
            }
        }
    }

    public GetNextMonday() {
        const nextMonday = new Date();
    
        nextMonday.setDate(nextMonday.getDate() + 1);
        nextMonday.setDate(
            nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7)
        );
    
        nextMonday.setHours(0);
        nextMonday.setMinutes(0);
        nextMonday.setSeconds(0);
    
        return nextMonday.toDateString();
    }

    private CheckVisit() {
        if (this.playerDB.nextMonday !== this.GetNextMonday()) {
            this.playerDB.nextMonday = this.GetNextMonday();
            this.playerDB.lastVisit = this.playerDB.totalVisit;
            this.playerDB.totalVisit = 0;
        }

        this.playerDB.totalVisit += 1;
        // switch (WorldService.worldId) {
        //     case WorldId.WorldId_Land:
        //         this.playerDB.entryTicket.wonderland = true;
        //         break;
        //     case WorldId.WorldId_Stage:
        //         this.playerDB.entryTicket.stage = true;
        //         break;
        //     case WorldId.WorldId_Studio:
        //         this.playerDB.entryTicket.studio = true;
        //         break;
        //     case WorldId.WorldId_Awards:
        //         this.playerDB.entryTicket.awards = true;
        //         break;
        // }

        // if (
        //     this.playerDB.entryTicket.wonderland == true &&
        //     this.playerDB.entryTicket.stage == true &&
        //     this.playerDB.entryTicket.studio == true &&
        //     this.playerDB.entryTicket.awards == true
        // ) {
        //     this.playerDB.entryTicket.wonderland = false;
        //     this.playerDB.entryTicket.stage = false;
        //     this.playerDB.entryTicket.studio = false;
        //     this.playerDB.entryTicket.awards = false;
        //     this.playerDB.entryTicketAmount += 1;
        //     UIManager.instance.OpenEntryTicket(this.playerDB.entryTicketAmount);
        // }
    }

    private *HideAndSeekEvent() {
        // while (true) {
        //     yield null;
        //     if (this.isGetPlayerDB) break;
        // }

        if (this.playerDB.isHSManager == false) return;

        const spot =
            this.hideAndSeek[
                Mathf.Floor(Random.Range(0, this.hideAndSeek.length))
            ];
        const character =
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;

        yield new WaitForSeconds(5);
        character.Teleport(spot.transform.position, spot.transform.rotation);

        const iterateTime = 60;
        const waitTime = new WaitForSeconds(1);

        yield waitTime;

        for (let i = 0; i < iterateTime; i++) {
            if (i % 2 == 0)
                character.MoveContinuously(
                    spot.transform.TransformDirection(Vector3.forward)
                );
            else
                character.MoveContinuously(
                    spot.transform.TransformDirection(Vector3.back)
                );

            yield waitTime;
        }

        character.StopMoving();
        // character.StateMachine.Stop();
        yield new WaitForSeconds(3);

        const randomIds = [
            "com.kofice.kwonderland",
            // "com.kofice.kwonderdrama",
            "com.kofice.kwonderlandpop",
            "com.kofice.kwonderawards",
        ];

        const id = randomIds[Mathf.Floor(Random.Range(0, 3))];
        console.log(id);
        ZepetoWorldContent.MoveToWorld(id, (errCode, errMsg) => {
            const onErrId = randomIds[Mathf.Floor(Random.Range(0, 3))];
            ZepetoWorldContent.MoveToWorld(onErrId, (errC, errM) => {});
        });
    }

    /*** Http Data Connection Service ***/
    /* GET */
    private SendRequest_GET() {
        const data = new RoomData();
        data.Add(SendName.METHOD, HttpData.GET);
        data.Add(SendName.URL, `${HttpData.GET_URL}${WorldService.userId}`);
        this.room.Send(MESSAGE.HTTP, data.GetObject());
        console.log(`[GameManager] Try Send Request Datas.....`);
    }

    /* POST */
    private SendRequest_POST(playerData?: PlayerDB) {
        const playerDB: PlayerDB = playerData
            ? playerData
            : HttpDataConnectionService.InitData;
        const jsonData = JSON.stringify(playerDB);
        this.playerDB = playerDB;
        this.isGetPlayerDB = true;

        const data = new RoomData();
        data.Add(SendName.DATA, jsonData);
        data.Add(SendName.METHOD, HttpData.POST);
        data.Add(SendName.URL, HttpData.POST_URL);
        this.room.Send(MESSAGE.HTTP, data.GetObject());
    }

    /* POST */
    public PlayerDBForceSave(callback: CallbackWorldPortal) {
        this.SendRequest_POST(this.playerDB);

        /*** Http Data Connection Service ***/
        this.room.AddMessageHandler(HttpData.POST, (message: boolean) => {
            if (message && callback != null) {
                callback();
                callback = null;
            }
        });
    }

    /* Set Player Data */
    private SetPlayerData(playerData: PlayerDB) {
        const isLatest = playerData.version == HttpData.Data_Version;
        console.log(
            `[HttpDataConnectionService] SetPlayerData-Recive : ${
                isLatest ? "Recent Data" : "old Data"
            }`
        );
        console.log(
            `[HttpDataConnectionService] PlayerData : \n${JSON.stringify(
                playerData
            )}`
        );

        const updatePlayerDB: PlayerDB =
            HttpDataConnectionService.UpdateData(playerData);
        console.log(
            `[HttpDataConnectionService] SetPlayerData-Send : ${
                updatePlayerDB.version == HttpData.Data_Version
                    ? "Recent Data"
                    : "old Data"
            }`
        );
        console.log(
            `[HttpDataConnectionService] UpdatePlayerDB : \n${JSON.stringify(
                updatePlayerDB
            )}`
        );

        this.SendRequest_POST(updatePlayerDB);
        // this.SendRequest_POST(HttpDataConnectionService.instance.InitData);
    }

    public EquippFood(sessionId: string, foodName: string) {
        this.foodManager.OnBuyFood(sessionId, foodName);
    }

    public UnequippFood(sessionId: string) {
        this.foodManager.OnRemoveFood(sessionId);
    }

    public InteractionCallback() {
        const hasFood = this.foodManager.CheckEquipped();
        if (hasFood) this.foodManager.RemoveFood();
    }

    public Toast(text: string, activeMainCanvas: boolean = false) {
        this.toastController.Toast(text, activeMainCanvas);
    }

    public PoseButtonPushed(wonderState: WonderState) {
        AnimationManager.SetWonderAnimation(wonderState);

        if (this.poseCoroutine) this.StopCoroutine(this.poseCoroutine);
        this.poseCoroutine = this.StartCoroutine(this.CheckMoveWhilePosing());
    }

    public BuskingIsStart(point: number, isStart: boolean) {
        this.buskingZoneManager.OnBuskingIsStart(point, isStart);
    }

    public BuskingAddHeart(point: number) {
        this.buskingZoneManager.AddHeart(point);
    }

    public MissionClear(missionType: MissionType) {
        if (missionType == MissionType.NONE) return;

        console.log("success");
        const data = new RoomData();
        data.Add(SendName.Type, missionType);
        this.room.Send(MESSAGE.MissionClear, data.GetObject());
    }

    public OnDataChanged() {
        const playerDB = JSON.stringify(this.playerDB);
        this.room.Send(MESSAGE.PlayerDB, playerDB);
    }

    public AddBadge() {
        let hasBadge: boolean = false;
        let hasHidden: boolean = false;
        let hasCount: number = 0;

        this.playerDB.wonderCollection.forEach((value, index) => {
            if (value.id !== WonderCollectionList.Hiddle_Collection) {
                if (value.id == WonderCollectionList.Wonder_Badge_Studio) {
                    if (value.has) hasBadge = true;
                    else value.has = true;
                }

                if (value.has) hasCount++;
            } else {
                hasHidden = value.has;
            }
        });

        if (hasBadge) {
            return;
        }

        if (hasCount == 3) {
            if (!hasHidden) {
                for (const wonderCollection of this.playerDB.wonderCollection) {
                    if (
                        wonderCollection.id ==
                        WonderCollectionList.Hiddle_Collection
                    ) {
                        wonderCollection.has = true;
                        break;
                    }
                }
                UIManager.instance.UpdateHiddenUI();
            }
            SDManager.instance.OnAddBadge();
        }

        this.room.Send(MESSAGE.AddBadge);
        UIManager.instance.UpdateBadgeUI();
        this.OnDataChanged();

        // for (const item of this.playerDB.wonderCollection) {
        //     if (item.id != WonderCollectionList.Wonder_Badge_Studio) continue;
        //     if (item.has) return;
        //     item.has = true;
        //     UIManager.instance.UpdateBadgeUI();
        //     this.room.Send(MESSAGE.AddBadge, null);
        //     break;
        // }
        // this.AllClearCheck();
    }

    private AllClearCheck() {
        if (!this.isGetPlayerDB) return false;
        UIManager.instance.UpdateHiddenUI();
    }

    public AddCoin(count: number = 1, isQuest: boolean = false) {
        GameManager.instance.playerDB.wonderCoin = Mathf.Clamp(
            GameManager.instance.playerDB.wonderCoin + count,
            0,
            HttpDataConnectionService.coinLimit
        );
        console.log(GameManager.instance.playerDB.wonderCoin);
        console.log(count);

        if (!isQuest) QuestManager.Instance.OnGetCoin(count);
        UIManager.instance.UpdateCoinUI();
    }

    public UseCoin(count: number = 1): boolean {
        if (this.playerDB.wonderCoin < count) return false;
        GameManager.instance.playerDB.wonderCoin = Mathf.Clamp(
            GameManager.instance.playerDB.wonderCoin - count,
            0,
            HttpDataConnectionService.coinLimit
        );
        UIManager.instance.UpdateCoinUI();
        return true;
    }

    public SetLocalPlayerSync(isOn: boolean) {
        const localPlayer = ZepetoPlayers.instance.LocalPlayer;
        const character = localPlayer.zepetoPlayer.character;
        const data = new RoomData();
        data.Add("isOn", isOn);

        this.room.Send(MESSAGE.PlayerSync, data.GetObject());
    }

    private *CheckMoveWhilePosing() {
        const character =
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        while (true) {
            if (character.tryJump || character.tryMove) break;
            yield null;
        }

        AnimationManager.StopWonderAnimation();
    }
}
