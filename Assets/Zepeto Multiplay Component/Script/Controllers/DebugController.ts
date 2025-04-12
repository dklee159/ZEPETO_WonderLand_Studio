import { Transform, Object, GameObject, Resources } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import TranslateManager, { LanguageType } from '../Lang/TranslateManager';
import LocalizeExternText from '../Lang/LocalizeExternText';
// import LocalizeExternImage from '../Lang/LocalizeExternImage';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import QuestManager from '../Manager/QuestManager';
import GameManager from '../GameManager';
import { QuestMenu } from '../TypeManager';

export default class DebugController extends ZepetoScriptBehaviour {
    private static _instance: DebugController;
    public static get Instance(): DebugController {
        if (!DebugController._instance) {
            const managerObj = GameObject.Find("DebugController");
            if (managerObj) DebugController._instance = managerObj.GetComponent<DebugController>();
        }
        return DebugController._instance;
    }

    @Header("Debug Mode Setting")
    @SerializeField() private isOn : boolean = false;
    @SerializeField() private debugLanguage : LanguageType = LanguageType.Kr;
    @SerializeField() private permmisionIds : string[] = [];
    @SerializeField() private debugUI : GameObject;
    @SerializeField() private menuBtn : Button;
    @SerializeField() private localTexts : GameObject[] = [];

    @Header("Jetski")
    @SerializeField() private isJetski : boolean = false;
    @SerializeField() private jetskiStartDinstance : number;

    @Header("Language")
    @SerializeField() private krBtn : Button;
    @SerializeField() private enBtn : Button;
    @SerializeField() private jpBtn : Button;
    @SerializeField() private chsBtn : Button;
    @SerializeField() private chtBtn : Button;
    @SerializeField() private thBtn : Button;
    @SerializeField() private inBtn : Button;
    @SerializeField() private vnBtn : Button;
    @SerializeField() private frBtn : Button;

    @Header("Teleport")
    @SerializeField() private languageBtn : Button;
    @SerializeField() private jetskiBtn : Button;
    @SerializeField() private foodBtn : Button;
    @SerializeField() private buskingBtn : Button;
    @SerializeField() private photoBoothBtn : Button;

    @SerializeField() private languagePoint : Transform;
    @SerializeField() private jetskiPoint : Transform;
    @SerializeField() private foodPoint : Transform;
    @SerializeField() private buskingPoint : Transform;
    @SerializeField() private photoBoothPoint : Transform;
    
    @Header("Quest")
    @SerializeField() private entranceWorldBtn : Button;
    @SerializeField() private initQuestBtn : Button;
    @SerializeField() private addQuestBtn : Button;
    @SerializeField() private entranceWorldID : string;
    @SerializeField() private initDate : string;
    @SerializeField() private lastDate : string;
    @SerializeField() private questMenu : string;
    @SerializeField() private questIndex : number;
    @SerializeField() private questValue : number;

    public get IsOn() : boolean { return this.isOn; }
    public get IsJetski() : boolean { return this.isOn && this.isJetski; }
    public get DebugLanguage() : LanguageType { return this.debugLanguage; }
    private set DebugLanguage(value : LanguageType) { this.debugLanguage = value; }

    Awake() {
        DebugController._instance = this;
    }

    Start() {
        if (!this.IsOn) {
            GameObject.Destroy(this.debugUI);
            GameObject.Destroy(this.menuBtn.gameObject);
            return;
        }
        // this.StartCoroutine(this.DebugStart());
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
            const localZepetoId = ZepetoPlayers.instance.LocalPlayer.name;
            // this.externTexts = Object.FindObjectsOfType<Button>();
            console.log(`LocalName : ${localZepetoId}`);
            this.languageBtn.onClick.AddListener(() => {
                character.Teleport(this.languagePoint.position, this.languagePoint.rotation);
            });
    
            this.jetskiBtn.onClick.AddListener(() => {
                character.Teleport(this.jetskiPoint.position, this.jetskiPoint.rotation);
            });
    
            this.foodBtn.onClick.AddListener(() => {
                character.Teleport(this.foodPoint.position, this.foodPoint.rotation);
            });
    
            this.buskingBtn.onClick.AddListener(() => {
                character.Teleport(this.buskingPoint.position, this.buskingPoint.rotation);
            });
    
            this.photoBoothBtn.onClick.AddListener(() => {
                character.Teleport(this.photoBoothPoint.position, this.photoBoothPoint.rotation);
            });
    
            this.krBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.Kr);
            });
    
            this.enBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.En);
            });
    
            this.jpBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.Jp);
            });
    
            this.chsBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.ChS);
            });
    
            this.chtBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.ChT);
            });
    
            this.thBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.Th);
            });
    
            this.inBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.In);
            });
    
            this.vnBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.Vn);
            });
    
            this.frBtn.onClick.AddListener(() => {
                this.OnClickLocalize(LanguageType.Fr);
            });

            this.menuBtn.onClick.AddListener(() => {
                this.debugUI.SetActive(!this.debugUI.activeInHierarchy);
            });

            this.entranceWorldBtn.onClick.AddListener(() => {
                QuestManager.Instance.OnVisitWorld(this.entranceWorldID);
            });

            this.initQuestBtn.onClick.AddListener(() => {
                QuestManager.Instance.InitData(GameManager.instance.playerDB, this.initDate, this.lastDate);
            });

            this.addQuestBtn.onClick.AddListener(() => {
                QuestManager.Instance.UpdateData(this.questMenu as QuestMenu, this.questIndex, this.questValue);
            });
        });
    }

    private OnClickLocalize(languageType : LanguageType) {
        this.DebugLanguage = languageType;
        this.localTexts.forEach((gameObj : GameObject) => {
            gameObj.GetComponent<LocalizeExternText>().DebugStart();
        });
    }

    public GetJetskiDistance() : number {
        if(this.IsJetski) return this.jetskiStartDinstance;
        else return 0;
    }
}
