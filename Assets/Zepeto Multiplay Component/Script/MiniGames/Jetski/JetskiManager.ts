import { GameObject, Transform, Debug, Time, Random, Vector3, Quaternion, Mesh, MeshFilter, Mathf, WaitForSeconds, Space, Sprite, Coroutine, HumanBodyBones, WaitUntil } from 'UnityEngine';
import { Image, Button, Text } from 'UnityEngine.UI';
import { ZepetoCharacter, ZepetoPlayerControl, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { List$1 } from 'System.Collections.Generic';
import UIManager from '../../Manager/UIManager';
import GameManager from '../../GameManager';
import AnimationManager, { AnimParamName, AnimParamType } from '../../Manager/AnimationManager';
import Rock from './Rock';
import MultiplayManager from '../../../ZepetoScript/Common/MultiplayManager';
import LeaderboardManager from '../../Manager/LeaderboardManager';
import { TextMeshProUGUI, TextMeshPro } from 'TMPro';
import LocalizeExternText from '../../Lang/LocalizeExternText';
import QuestManager from '../../Manager/QuestManager';
import { WonderCollectionList } from '../../TypeManager';
import DebugController from '../../Controllers/DebugController';
import SDManager from '../../Manager/SDManager';
import EquipManager from '../../Manager/EquipManager';

export default class JetskiManager extends ZepetoScriptBehaviour {
    /* UIs */
    @Header("UIs")
    @SerializeField() private jetskiUI : GameObject;
    @SerializeField() private descriptionPanel : Image;
    @SerializeField() private startCount : Image;
    @SerializeField() private startImage : Image;
    @SerializeField() private descriptionImage : Image;
    @SerializeField() private meterUI : Image;
    @SerializeField() private gameOverImg : Image;
    @SerializeField() private gameOverInfos : Transform;
    @SerializeField() private gameStateImages: Sprite[];

    /* Game Buttons */
    @Header("Buttons")
    @SerializeField() private moveRightBtn : Button;
    @SerializeField() private moveLeftBtn : Button;
    @SerializeField() private startBtn : Button;
    @SerializeField() private retryBtn : Button;
    @SerializeField() private stopBtn : Button;
    @SerializeField() private infosCloseBtn : Button;
    @SerializeField() private desCloseBtn : Button;

    /* Game Objects */
    @Header("Game Objects")
    @SerializeField() private _ranking : GameObject;
    @SerializeField() private returnPoint : Transform;
    @SerializeField() private jetskiZone : Transform;
    @SerializeField() private jetskiPrefab : GameObject;
    @SerializeField() private rockPrefab : GameObject;
    @SerializeField() private lane_1 : Transform;
    @SerializeField() private lane_2 : Transform;
    @SerializeField() private lane_3 : Transform;
    @SerializeField() private rockLane_1 : Transform;
    @SerializeField() private rockLane_3 : Transform;
    @SerializeField() private rockLane_2 : Transform;
    @SerializeField() private bodyBone : HumanBodyBones;
    

    /* Sources */
    @Header("Sources")
    @SerializeField() private countSprites : Sprite[] = [];
    @SerializeField() private badgeSprites : Sprite[] = [];
    @SerializeField() private jetskiMeshs : Mesh[] = [];
    @SerializeField() private guideSprites : Sprite[] = [];

    /* Properties */
    @Header("Properties")
    @SerializeField() private speed : number;
    @SerializeField() private spawnInterval : number;
    @SerializeField() private accel : number = 0.1;
    @SerializeField() private limitDist : number = 1000;

    /* Variables */
    private isRiding : boolean = false;
    private jetski : GameObject;
    private moveDistance : number;
    private spawnTimer : number = 0;
    private originGravity : number;
    private currentLane : Transform;
    private rocks : List$1<Rock> = new List$1<Rock>();
    private moveCoroutine : Coroutine;
    private character : ZepetoCharacter;
    private descriptionIndex : number = 0;
    private ranking : LeaderboardManager;
    private camDistance : number = 0;

    /* Getter Setter */
    public get MoveDistance() : number { return this.moveDistance; }
    public set MoveDistance(value : number) {
        this.moveDistance = value;
        this.meterUI.GetComponentInChildren<TextMeshProUGUI>().text = 
        `${Mathf.Floor(value)}m`;
    }

    Start() {
        this.startBtn.onClick.AddListener(() => {
            this.descriptionIndex++;
            if (this.descriptionIndex > 1) this.RideStart();
            else if (this.descriptionIndex == 1) {
                this.SetDescriptionPanel();
            }
        });

        this.desCloseBtn.onClick.AddListener(() => {
            this.RideStart();
        });
        
        this.moveRightBtn.onClick.AddListener(() => {
            this.OnMoveRight();
        });
        
        this.moveLeftBtn.onClick.AddListener(() => {
            this.OnMoveLeft();
        });

        this.infosCloseBtn.onClick.AddListener(() => {
            this.ReturnToGuide();
        });

        this.retryBtn.onClick.AddListener(() => {
            this.CleanRocks();
            this.gameOverInfos.gameObject.SetActive(false);
            this.RideStart();
        });

        this.stopBtn.onClick.AddListener(() => {
            this.ReturnToGuide();
        });

        this.ranking = this._ranking.GetComponent<LeaderboardManager>();
    }
    
    private CleanRocks() {
        const rocks = this.jetskiZone.GetChild(1);
        const count = rocks.childCount;

        for (let i = 0; i < count; i++) {
            GameObject.Destroy(rocks.GetChild(i).gameObject);
        }
        this.rocks.Clear();
    }

    private SetDescriptionPanel() {
        const btnText = this.startBtn.GetComponentInChildren<Text>();
        const btnLocal = btnText.GetComponent<LocalizeExternText>();
        const guideText = this.descriptionPanel.transform.GetChild(1).GetComponent<Text>()
        const guideLocal = guideText.GetComponent<LocalizeExternText>();

        btnText.text = btnLocal.GetArrayText(this.descriptionIndex)[0];
        guideText.text = guideLocal.GetArrayText(this.descriptionIndex)[0];
        console.log(this.descriptionIndex);
        this.descriptionImage.sprite = this.guideSprites[this.descriptionIndex];
        // this.descriptionPanel.transform.GetChild(1).GetComponent<Text>().text = context;
    }

    private OnMoveRight() {
        if (this.currentLane == this.lane_3) return;

        let lane : Transform;
        if (this.currentLane == this.lane_1) lane = this.lane_2;
        else if(this.currentLane == this.lane_2) lane = this.lane_3;
        this.MoveToLane(lane);
    }

    private OnMoveLeft() {
        if (this.currentLane == this.lane_1) return;

        let lane : Transform;
        if (this.currentLane == this.lane_3) lane = this.lane_2;
        else if (this.currentLane == this.lane_2) lane = this.lane_1;
        this.MoveToLane(lane);
    }

    private * SmoothMove(targetLane : Transform) {
        const targetPos = targetLane.position;

        while (true) {
            this.character.transform.position = Vector3.Lerp(this.character.transform.position, targetPos, 0.1);
            if (Vector3.Distance(this.character.transform.position, targetPos) < 0.01) {
                this.moveCoroutine = null;
                break;
            }
            yield null;
        }
    }

    private MoveToLane(targetLane : Transform) {
        // smoothly
        if (this.moveCoroutine != null) this.StopCoroutine(this.moveCoroutine);
        this.moveCoroutine = this.StartCoroutine(this.SmoothMove(targetLane));
        this.currentLane = targetLane;
    }

    public UIActivate() {
        this.jetskiUI.SetActive(true);
        UIManager.instance.SetDialogueUI(() => { this.MoveToZone(); }, 6, 7);
    }

    public MoveToZone() {
        this.descriptionIndex = 0;

        // 캐릭터 위치 동기화 연결 끊기
        GameManager.instance.SetLocalPlayerSync(false);

        // 기본 컨트롤러 끄기
        ZepetoPlayers.instance.controllerData.inputAsset.Disable();
        ZepetoPlayers.instance.transform.GetChild(0).GetChild(0).GetComponent<ZepetoPlayerControl>().Enable = false;

        // 제트스키 스폰 및 위치 초기화
        const randomNum = Mathf.Floor(Random.Range(0, this.jetskiMeshs.length - 1));
        const sessionId = MultiplayManager.instance.Room.SessionId;
        const boneTransform = AnimationManager.GetBone(sessionId, this.bodyBone);
        this.jetski = GameObject.Instantiate<GameObject>(this.jetskiPrefab, boneTransform);
        this.jetski.GetComponent<MeshFilter>().mesh = this.jetskiMeshs[randomNum];
        this.jetski.transform.Rotate(new Vector3(-90, -90, -90));
        this.jetski.transform.Translate(new Vector3(0.84, 0, 0));
        const sit = this.jetski.transform.GetChild(0);

        // 캐릭터 위치 초기화, 애니메이션 재생
        const initPos : Vector3 = this.lane_2.position;
        const initRot : Quaternion = this.lane_2.rotation;
        const localPlayer = ZepetoPlayers.instance.LocalPlayer;
        this.character = localPlayer.zepetoPlayer.character;
        this.character.Teleport(initPos, initRot);
        this.character.transform.SetParent(sit.parent);
        this.originGravity = this.character.motionState.gravity;
        this.character.motionState.gravity = 0;
        
        UIManager.instance.SetDefaultPlayerController(false);
        UIManager.instance.SetDefaultButton(false);
        AnimationManager.SetCharacterAnimation(sessionId, AnimParamType.Bool, AnimParamName.Jetski, true);
        this.character.StateMachine.constraintStateAnimation = true;

        // 카메라 위치 초기화
        this.camDistance = ZepetoPlayers.instance.ZepetoCamera.distance;
        console.log(`cam distance : ${this.camDistance}`);
        const cam = ZepetoPlayers.instance.ZepetoCamera.camera;
        cam.transform.parent.rotation = Quaternion.Euler(15, 0, 0);
        ZepetoPlayers.instance.cameraData.minZoomDistance = 5;
        ZepetoPlayers.instance.cameraData.maxZoomDistance = 5;
        // 설명문 초기화
        this.descriptionPanel.gameObject.SetActive(true);
        this.SetDescriptionPanel();
        this.currentLane = this.lane_2;

        SDManager.instance.Invisible();
        EquipManager.instance.InvisibleAll();
    }

    public RideStart() {
        if (!this.isRiding) {
            this.isRiding = true;
            this.spawnTimer = 10;
            // this.MoveDistance = 0;
            this.descriptionIndex = 0;
            
            this.descriptionPanel.gameObject.SetActive(false);
            this.StartCoroutine(this.StartJetskiRiding());
            this.MoveDistance = DebugController.Instance.GetJetskiDistance();
        }
        else {
            Debug.Log("Jetski is already start");
        }
    }

    private * StartJetskiRiding() {
        let startCnt : number = 0;
        this.startCount.gameObject.SetActive(true);
        ZepetoPlayers.instance.LocalPlayer.zepetoCamera.StateMachine.Stop();

        while (startCnt < 3) {
            this.startCount.sprite = this.countSprites[startCnt];

            yield new WaitForSeconds(1);

            startCnt++;
        }

        this.meterUI.gameObject.SetActive(true);
        this.moveRightBtn.gameObject.SetActive(true);
        this.moveLeftBtn.gameObject.SetActive(true);

        this.startCount.gameObject.SetActive(false);
        this.startImage.gameObject.SetActive(true);
        yield new WaitForSeconds(1);
        this.startImage.gameObject.SetActive(false);

        let speed = this.speed;
        let spawnInterval = this.spawnInterval;
        while (this.isRiding) {
            this.spawnTimer += Time.deltaTime;
            const beforeUnit = Mathf.Floor(this.MoveDistance * 0.01);
            this.MoveDistance += Time.deltaTime * this.speed;
            const nextUnit = Mathf.Floor(this.MoveDistance * 0.01);

            if (this.MoveDistance >= this.limitDist) {
                this.MoveDistance = this.limitDist;
                this.RideStop(true);
                break;
            }

            // 100 미터 지나갈때마다 난이도 증가
            if (beforeUnit != nextUnit) {
                speed += this.accel;
                spawnInterval -= spawnInterval * 0.1;
                this.SetRocksSpeed(speed);
            }

            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                this.SpawnRocks(speed);
            }
            yield null;
        }
    }

    private SpawnRocks(setSpeed: number) {
        const emptyLane = Mathf.Floor(Random.Range(0, 3));
        let lane1Pos : Vector3;
        let lane2Pos : Vector3;
        let dir1 : Vector3;
        let dir2 : Vector3;
        
        if (emptyLane == 0) {
            lane1Pos = this.rockLane_2.position; 
            lane2Pos = this.rockLane_3.position;
            dir1 = (this.lane_2.position - lane1Pos).normalized;
            dir2 = (this.lane_3.position - lane2Pos).normalized;
        }    
        else if (emptyLane == 1) {
            lane1Pos = this.rockLane_1.position; 
            lane2Pos = this.rockLane_3.position;
            dir1 = (this.lane_1.position - lane1Pos).normalized;
            dir2 = (this.lane_3.position - lane2Pos).normalized;
        }
        else if (emptyLane == 2) {
            lane1Pos = this.rockLane_1.position;
            lane2Pos = this.rockLane_2.position;
            dir1 = (this.lane_1.position - lane1Pos).normalized;
            dir2 = (this.lane_2.position - lane2Pos).normalized;
        }

        this.SpawnRock(lane1Pos, dir1, setSpeed);
        this.SpawnRock(lane2Pos, dir2, setSpeed);
    }

    private SpawnRock(pos : Vector3, dir : Vector3, setSpeed: number) {
        const rockObj : GameObject = GameObject.Instantiate<GameObject>(this.rockPrefab, pos , this.rockPrefab.transform.rotation, this.jetskiZone.GetChild(1));
        const rock = rockObj.GetComponent<Rock>();
        rock.onDestroy.AddListener(() => {
            this.RockDestroyed(rock);
        });

        this.rocks.Add(rock);
        rock.Speed = setSpeed;
        rock.Dir = dir;
        rock.StartMove(this);
    }

    public RockDestroyed(rock : Rock) {
        console.log(rock.gameObject);
        this.rocks.Remove(rock);
        if (!rock.gameObject.IsDestroyed) GameObject.Destroy(rock.gameObject);
    }

    public SetRocksSpeed(speed : number) {
        this.rocks.ForEach((rock : Rock) => {
            rock.Speed = speed;
        })
    }

    private * StopJetskiRiding(isClear: boolean) {
        // 게임오버 이미지
        this.gameOverImg.sprite = this.gameStateImages[isClear ? 0 : 1]
        this.gameOverImg.gameObject.SetActive(true);
        yield new WaitForSeconds(2);

        // 게임결과 정보
        this.gameOverImg.gameObject.SetActive(false);
        this.gameOverInfos.gameObject.SetActive(true);
        
        const meter : number = Mathf.Floor(this.MoveDistance);
        const coin = Mathf.Floor(meter / 100) * 100;
        const point : number = meter;

        const meterUI = this.gameOverInfos.transform.GetChild(0);
        const coinUI = this.gameOverInfos.transform.GetChild(1);
        const pointUI = this.gameOverInfos.transform.GetChild(2);
        const badgeUI = this.gameOverInfos.transform.GetChild(3);

        let has : boolean = false;
        let badgeSprite : Sprite = this.badgeSprites[0];
        for (const item of GameManager.instance.playerDB.wonderCollection) {
            if (item.id == WonderCollectionList.Wonder_Badge_Studio) {
                has = item.has;
                console.log("has badge");
                break;
            }
        }

        if (has) {
            badgeSprite = this.badgeSprites[1];
        }
        else if(meter >= 300) {

            badgeSprite = this.badgeSprites[1];
            GameManager.instance.AddBadge();
        }

        meterUI.GetComponent<Text>().text = `${meter}m`;
        coinUI.GetComponent<Text>().text = `+ ${coin}`;
        pointUI.GetComponent<Text>().text = `+ ${point}`;
        badgeUI.GetComponent<Image>().sprite = badgeSprite;
        this.ranking.SetRanking(point);
        QuestManager.Instance.OnPlayGame(meter);
        GameManager.instance.AddCoin(coin);
    }

    private ReturnToGuide() {
        GameManager.instance.SetLocalPlayerSync(true);
        ZepetoPlayers.instance.controllerData.inputAsset.Enable();
        this.gameOverInfos.gameObject.SetActive(false);
        
        this.character.Teleport(this.returnPoint.position, this.returnPoint.rotation);
        this.character.transform.SetParent(null);
        this.character.motionState.gravity = this.originGravity;
        this.character.StateMachine.constraintStateAnimation = false;
        const sessionid = MultiplayManager.instance.Room.SessionId;
        UIManager.instance.SetDefaultPlayerController(true);
        UIManager.instance.SetDefaultButton(true);
        AnimationManager.SetCharacterAnimation(sessionid, AnimParamType.Bool, AnimParamName.Jetski, false);
        this.meterUI.gameObject.SetActive(false);

        this.StartCoroutine(this.ReturnCor());
        
        this.CleanRocks();
        GameObject.Destroy(this.jetski);
        SDManager.instance.Visible();
        EquipManager.instance.VisibleAll();
    }

    private * ReturnCor() {
        const zepetoCam = ZepetoPlayers.instance.LocalPlayer.zepetoCamera;
        zepetoCam.StateMachine.Start(zepetoCam.currentState);
        
        
        ZepetoPlayers.instance.cameraData.maxZoomDistance = this.camDistance;
        ZepetoPlayers.instance.cameraData.minZoomDistance = this.camDistance;
        yield new WaitUntil(() => this.character.characterController.isGrounded);
        ZepetoPlayers.instance.cameraData.maxZoomDistance = 13;
        ZepetoPlayers.instance.cameraData.minZoomDistance = 0.5;

        ZepetoPlayers.instance.transform.GetChild(0).GetChild(0).GetComponent<ZepetoPlayerControl>().Enable = true;
    }

    public RideStop(isClear: boolean) {
        this.isRiding = false;
        this.moveRightBtn.gameObject.SetActive(false);
        this.moveLeftBtn.gameObject.SetActive(false);
        this.SetRocksSpeed(0);
        this.StopCoroutine(this.StartJetskiRiding());
        this.StartCoroutine(this.StopJetskiRiding(isClear));
    }
}
