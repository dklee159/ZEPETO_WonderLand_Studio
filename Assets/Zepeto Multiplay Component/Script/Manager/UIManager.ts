import { GameObject, Transform, Debug } from 'UnityEngine';
import { Button, Text } from 'UnityEngine.UI';
import { UIZepetoPlayerControl, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from '../GameManager';
import AnimationManager, { WonderState } from './AnimationManager';
import { TextMeshProUGUI, TextMeshPro } from 'TMPro';
import LocalizeExternText from '../Lang/LocalizeExternText';
import { WonderCollectionList, MESSAGE } from '../TypeManager';
import MultiplayManager from '../../ZepetoScript/Common/MultiplayManager';
import GiftController from '../Controllers/GiftController';

type DialogueCallback = () => void;
export default class UIManager extends ZepetoScriptBehaviour {
    /* UIs */
    @Header("UIs")
    @SerializeField() dialogueUI : Transform;
    @SerializeField() public canvas : GameObject;
    @SerializeField() private buttonPanel : Transform;
    @SerializeField() private hiddenUI: Transform;
    @SerializeField() private badgeUI: Transform;
    @SerializeField() private questUI: Transform;
    @SerializeField() private visitUI: Transform;
    @SerializeField() private zepetoScreenShotModule : Transform;
    @SerializeField() private wonderCoinTexts: TextMeshProUGUI[] = [];
    @SerializeField() private giftController : GameObject;

    /* Variables */
    private dialogueText : Text;
    private dialogueCloseBtn : Button;
    private dialogueNextBtn: Button;
    private dialogueTexts : string[] = [];
    private dialogueIndex : number = 0;
    private dialogueCallback : DialogueCallback;
    private _openUI: GameObject;

    /* Getter Setter */
    public get openUI(): GameObject { return this._openUI; }
    public set openUI(value: GameObject) {
        if(!this._openUI) {
            this._openUI = value;
            this._openUI.SetActive(true);
        } else {
            console.error("ALREADY OPENED....");
        }
    }

    /* Singleton */
    private static _instance: UIManager;
    public static get instance(): UIManager {
        if (!UIManager._instance) {
            const managerObj = GameObject.Find("UIManager");
            if (managerObj) UIManager._instance = managerObj.GetComponent<UIManager>();
        }
        return UIManager._instance;
    }

    Awake() {
        UIManager._instance = this;
    }

    Start() {
        // init dialogue;
        this.dialogueCloseBtn = this.dialogueUI.GetChild(1).GetComponent<Button>();
        this.dialogueNextBtn = this.dialogueUI.GetChild(2).GetComponent<Button>();
        this.dialogueText = this.dialogueUI.GetChild(3).GetComponent<Text>();
        
        // panel init
        const mainButtonPanel = this.buttonPanel.GetChild(0);
        const posePanel = this.buttonPanel.GetChild(1);
        const lockPanel = this.buttonPanel.GetChild(2);

        // button init
        const hiddenButton = mainButtonPanel.GetChild(0).GetComponent<Button>();
        const badgeButton = mainButtonPanel.GetChild(1).GetComponent<Button>();
        const questButton = mainButtonPanel.GetChild(2).GetComponent<Button>();
        const visitButton = mainButtonPanel.GetChild(3).GetComponent<Button>();
        const poseButton_1 = posePanel.GetChild(0).GetComponent<Button>();
        const poseButton_2 = posePanel.GetChild(1).GetComponent<Button>();
        const poseButton_3 = posePanel.GetChild(2).GetComponent<Button>();
        const awardPoseButton_1 = posePanel.GetChild(3).GetComponent<Button>();
        const awardPoseButton_2 = posePanel.GetChild(4).GetComponent<Button>();
        const awardPoseButton_3 = posePanel.GetChild(5).GetComponent<Button>();
        
        poseButton_1.onClick.AddListener(() => {
            GameManager.instance.PoseButtonPushed(WonderState.Panel_Pose_1);
        });

        poseButton_2.onClick.AddListener(() => {
            GameManager.instance.PoseButtonPushed(WonderState.Panel_Pose_2);
        });

        poseButton_3.onClick.AddListener(() => {
            GameManager.instance.PoseButtonPushed(WonderState.Panel_Pose_3);
        });

        awardPoseButton_1.onClick.AddListener(() => {
            GameManager.instance.PoseButtonPushed(WonderState.Panel_LOCK_Pose_1);
        });

        awardPoseButton_2.onClick.AddListener(() => {
            GameManager.instance.PoseButtonPushed(WonderState.Panel_LOCK_Pose_2);
        });

        awardPoseButton_3.onClick.AddListener(() => {
            GameManager.instance.PoseButtonPushed(WonderState.Panel_LOCK_Pose_3);
        });

        hiddenButton.onClick.AddListener(() => {
            this.openUI = this.hiddenUI.gameObject;
        });

        badgeButton.onClick.AddListener(() => {
            this.openUI = this.badgeUI.gameObject;
        });

        questButton.onClick.AddListener(() => {
            this.openUI = this.questUI.gameObject;
        });

        visitButton.onClick.AddListener(() => {
            this.openUI = this.visitUI.gameObject;
        });

        this.dialogueNextBtn.onClick.AddListener(() => {
            this.OnNextDialogue();
        });

        this.dialogueCloseBtn.onClick.AddListener(() => {
            this.OnCloseDialogue();
        });

        this.SetBadgeUI();
        this.SetHiddenUI();
        this.SetQuestUI();
        this.SetEventUI();
    }

    public RemoteStart() {
        this.UpdateHiddenUI();
        this.UpdateBadgeUI();
        this.UpdateVisitCount();
    }
    public UpdateBadgeUI() {
        const badgeGroup = this.badgeUI.GetChild(2);
        const wonderCollection = GameManager.instance.playerDB.wonderCollection;
        for(const item of wonderCollection) {
            if(item.id == WonderCollectionList.Wonder_Badge_Hall) {
                // item.has = SyncIndexManager.BADGE_HALL;
                badgeGroup.GetChild(0).gameObject.SetActive(item.has);
                // if(item.has) GameManager.Instance.MissionAllClear();

            } else if(item.id == WonderCollectionList.Wonder_Badge_Stage) {
                badgeGroup.GetChild(1).gameObject.SetActive(item.has);

            } else if(item.id == WonderCollectionList.Wonder_Badge_Studio) {
                badgeGroup.GetChild(2).gameObject.SetActive(item.has);
            }
        }
    }

    public UpdateHiddenUI() {
        const wonderCollections = GameManager.instance.playerDB.wonderCollection;
        let hasHidden : boolean = false;

        for(const wonderCollection of wonderCollections) {
            if(wonderCollection.id == WonderCollectionList.Hiddle_Collection) {
                hasHidden = wonderCollection.has;
                break;
            }
        }

        this.giftController.GetComponent<GiftController>().SetInteractable(hasHidden);

        if(hasHidden) {
            const itemGroup = this.hiddenUI.GetChild(0).GetChild(2).GetChild(6);
            itemGroup.gameObject.SetActive(hasHidden);
            
            // Lock Pose
            const lockPanel = this.buttonPanel.GetChild(2);
            lockPanel.gameObject.SetActive(!hasHidden);
        }
    }

    public GetGiftController() {
        return this.giftController.GetComponent<GiftController>();
    }

    public GetLoadingImage(): GameObject {
        for (let i = this.canvas.transform.childCount - 1; i >= 0; i--) {
          const ui = this.canvas.transform.GetChild(i);
          console.log(`GetLoadingImage ...... ${i} === ${ui.tag}`);
    
          if (ui.CompareTag(`Loading`)) return ui.gameObject;
        }
        return null;
    }

    public SetDialogueUI(callback : any, ...indexs : number[]) {
        if (this.dialogueText == null) this.dialogueUI.GetComponentInChildren<Text>();
        this.dialogueIndex = 0;
        this.dialogueUI.gameObject.SetActive(true);
        const localText = this.dialogueText.GetComponent<LocalizeExternText>();
        this.dialogueTexts = localText.GetArrayText(...indexs);
        this.dialogueText.text = this.dialogueTexts[0];
        if(callback != null) this.dialogueCallback = callback;
    }

    private OnNextDialogue() {
        this.dialogueIndex++;
        if (this.dialogueIndex == this.dialogueTexts.length) {
            if (this.dialogueCallback != null) this.dialogueCallback();
            this.OnCloseDialogue();
        }
        else {
            this.dialogueText.text = this.dialogueTexts[this.dialogueIndex];
        }
    }

    private OnCloseDialogue() {
        while (this.dialogueTexts.length > 0)
            this.dialogueTexts.pop();
        this.dialogueCallback = null;
        this.dialogueUI.gameObject.SetActive(false);
    }

    private SetBadgeUI() {
        const closeButton = this.badgeUI.GetChild(1).GetComponent<Button>();
        const badgeGroup = this.badgeUI.GetChild(2);

        closeButton.onClick.AddListener(() => {
            this.DeactiveOpenUI(this.badgeUI.gameObject);
        });

        badgeGroup.GetChild(0).gameObject.SetActive(false);
        badgeGroup.GetChild(1).gameObject.SetActive(false);
        badgeGroup.GetChild(2).gameObject.SetActive(false);
        
        this.badgeUI.gameObject.SetActive(false);
    }

    private SetHiddenUI() {
        const closeButton = this.hiddenUI.GetChild(1).GetComponent<Button>();
        const itemGroup = this.hiddenUI.GetChild(0).GetChild(2).GetChild(6);

        closeButton.onClick.AddListener(() => {
            this.DeactiveOpenUI(this.hiddenUI.gameObject);
        });

        // Item OFF
        itemGroup.gameObject.SetActive(false);
        
        this.hiddenUI.gameObject.SetActive(false);
    }

    private SetQuestUI() {
        const closeButton = this.questUI.GetChild(0).GetChild(1).GetComponent<Button>();

        closeButton.onClick.AddListener(() => {
            this.DeactiveOpenUI(this.questUI.gameObject);
        })

        this.questUI.gameObject.SetActive(false);
    }

    private SetEventUI() {
        const closeButton = this.visitUI.GetChild(0).GetChild(1).GetComponent<Button>();
        
        closeButton.onClick.AddListener(() => {
            this.DeactiveOpenUI(this.visitUI.gameObject);
        });

        this.visitUI.gameObject.SetActive(false);
    }

    private UpdateVisitCount() {
        const mainButtonPanel = this.buttonPanel.GetChild(0);
        const visitCount = mainButtonPanel.GetChild(3).GetComponentInChildren<Text>();

        // console.log(JSON.stringify(GameManager.instance.playerDB));
        visitCount.text = GameManager.instance.playerDB.totalVisit.toString();
    }

    public UpdateCoinUI() {
        const coin = GameManager.instance.playerDB.wonderCoin;
        for (const text of this.wonderCoinTexts) text.text = this.ProcessingScore(coin);
        // const playerDB = JSON.stringify(GameManager.Instance.playerDB);
        // MultiplayManager.Instance.Room?.Send(MESSAGE.PlayerDB, playerDB);
    }

    public OpenEntryTicket(amount: number) {
        
    }

    public SetDefaultPlayerController(isOn: boolean) {
        const controller = ZepetoPlayers.instance.gameObject.GetComponentInChildren<UIZepetoPlayerControl>();
        
        if (controller == null) return;
        
        if (isOn) ZepetoPlayers.instance.controllerData.inputAsset.Enable();
        else ZepetoPlayers.instance.controllerData.inputAsset.Disable();

        const moveController = controller.transform.GetChild(0).GetChild(1);
        const jumpController = controller.transform.GetChild(0).GetChild(2);

        moveController.gameObject.SetActive(isOn);
        jumpController.gameObject.SetActive(isOn);
    }

    public SetDefaultButton(isOn : boolean) {
        this.buttonPanel.gameObject.SetActive(isOn);
        this.zepetoScreenShotModule.gameObject.SetActive(isOn);
    }

    public DeactiveOpenUI(ui:GameObject) {
        if(this.openUI) this.openUI.SetActive(false);
        if(ui) ui.SetActive(false);
        if(this.openUI == ui) {
            this._openUI = null;
            return true;
        }
        return false;
    }

    private ProcessingScore(num: number) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}