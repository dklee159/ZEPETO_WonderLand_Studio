import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import InteractionBtn from '../Interaction/InteractionBtn'
import { GameObject, AudioSource } from 'UnityEngine';
import DrawManager from './Draw/DrawManager';
import JetskiManager from './Jetski/JetskiManager';
import FoodManager from '../Manager/FoodManager';
import PhotoBoothManager from '../Manager/PhotoBoothManager';
import LanguageZoneManager from '../Manager/LanguageZoneManager';
import GameManager from '../GameManager';
import QuizGameManager from './QuizGame/QuizGameManager';
import BuskingZoneManager from '../Manager/BuskingZoneManager';
import LeaderboardManager from '../Manager/LeaderboardManager';
import ChairController from '../Controllers/ChairController';

export default class GameInteraction extends ZepetoScriptBehaviour {

    @SerializeField() private _interactionType: InteractionType;
    @SerializeField() private _manager: GameObject;

    private _interactionBtn: InteractionBtn;
    private _managerComponent: LeaderboardManager | LanguageZoneManager | ChairController | DrawManager | QuizGameManager | PhotoBoothManager | JetskiManager | FoodManager | GameObject | BuskingZoneManager;
    
    Start() {    
        this._interactionBtn = this.GetComponent<InteractionBtn>();        
        this._interactionBtn.onClickEvent.AddListener(() => {
            GameManager.instance.InteractionCallback();
            if (!(this._interactionType == InteractionType.LanguageAudio ||this._interactionType == InteractionType.BuskingHeart_1 || this._interactionType == InteractionType.BuskingHeart_2)) this._interactionBtn.HideIcon();
            
            this.DoInteraction();
        })
    }

    public DoInteraction() {
        switch (this._interactionType) {
            case InteractionType.LanguageZone:
                this._managerComponent = this._manager.GetComponent<LanguageZoneManager>();
                this._managerComponent.MoveToLanguageZone();
                break;
            case InteractionType.ReturnAtLanguage:
                this._managerComponent = this._manager.GetComponent<LanguageZoneManager>();
                this._managerComponent.ReturnToPoint();
                break;
            case InteractionType.QuizGame:
                this._managerComponent = this._manager.GetComponent<QuizGameManager>();
                this._managerComponent.StartQuiz();
                break;
            case InteractionType.DrawWord:                
                this._managerComponent = this._manager.GetComponent<DrawManager>();
                this._managerComponent.DrawStart();
                break;
            case InteractionType.LanguageAudio:
                this._managerComponent = this._manager.GetComponent<LanguageZoneManager>();
                this._managerComponent.PlaySound(this.GetComponent<AudioSource>());
                break;
            case InteractionType.Jetski:
                this._managerComponent = this._manager.GetComponent<JetskiManager>();
                this._managerComponent.UIActivate();
                break;
            case InteractionType.Ranking:
                this._managerComponent = this._manager.GetComponent<LeaderboardManager>();
                this._managerComponent.ShowRanking();
                break;
            case InteractionType.PhotoBooth:
                this._managerComponent = this._manager.GetComponent<PhotoBoothManager>();
                this._managerComponent.PhotoBoothStart();
                break;
            case InteractionType.Busking_1:
                this._managerComponent = this._manager.GetComponent<BuskingZoneManager>();
                this._managerComponent.BuskingIsStart(1, true);
                break;
            case InteractionType.BuskingHeart_1:
                this._managerComponent = this._manager.GetComponent<BuskingZoneManager>();
                this._managerComponent.AddHeart(1);
                break;
            case InteractionType.Busking_2:
                this._managerComponent = this._manager.GetComponent<BuskingZoneManager>();
                this._managerComponent.BuskingIsStart(2, true);
                break;
            case InteractionType.BuskingHeart_2:
                this._managerComponent = this._manager.GetComponent<BuskingZoneManager>();
                this._managerComponent.AddHeart(2);
                break;
            case InteractionType.Ttekbokki:
                this._managerComponent = this._manager.GetComponent<FoodManager>();
                this._managerComponent.OpenPurchaseUI(this._interactionType);
                break;
            case InteractionType.RawMeat:
                this._managerComponent = this._manager.GetComponent<FoodManager>();
                this._managerComponent.OpenPurchaseUI(this._interactionType);
                break;
            case InteractionType.Jeon:
                this._managerComponent = this._manager.GetComponent<FoodManager>();
                this._managerComponent.OpenPurchaseUI(this._interactionType);
                break;
            case InteractionType.Bibim:
                this._managerComponent = this._manager.GetComponent<FoodManager>();
                this._managerComponent.OpenPurchaseUI(this._interactionType);
                break;
            case InteractionType.Chicken:
                this._managerComponent = this._manager.GetComponent<FoodManager>();
                this._managerComponent.OpenPurchaseUI(this._interactionType);
                break;
            case InteractionType.TwistedBread:
                this._managerComponent = this._manager.GetComponent<FoodManager>();
                this._managerComponent.OpenPurchaseUI(this._interactionType);
                break;
            case InteractionType.ChairSit:
                this._managerComponent = this._manager.GetComponent<ChairController>();
                this._managerComponent.SitOnChair();
                break;
            default:
                break;
        }
    }
}

export enum InteractionType {
    PhotoBooth = 50,
    LanguageZone = 60,
    DrawWord = 61,
    QuizGame = 62,
    LanguageAudio = 63,
    ReturnAtLanguage = 64,
    Busking_1 = 70,
    Busking_2 = 71,
    BuskingHeart_1 = 72,
    BuskingHeart_2 = 73,
    Jetski = 80,
    Ranking = 81,
    Ttekbokki = 90,          // 떡볶이
    RawMeat = 91,            // 육회
    Jeon = 93,               // 전
    Bibim = 98,              // 비빔밥
    Chicken = 99,            // 닭강정
    TwistedBread = 100,      // 꽈배기
    ChairSit = 110,
}