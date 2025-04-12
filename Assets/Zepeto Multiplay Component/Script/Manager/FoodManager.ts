import { HumanBodyBones, GameObject, Sprite, Debug, Quaternion, Vector3 } from 'UnityEngine';
import { Image, Button, Text } from 'UnityEngine.UI';
import { RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { InteractionType } from '../MiniGames/GameInteraction';
import MultiplayManager from '../../ZepetoScript/Common/MultiplayManager';
import { MESSAGE, SendName } from '../TypeManager';
import AnimationManager, { AnimParamName, AnimParamType } from './AnimationManager';
import GameManager from '../GameManager';
import LocalizeExternText from '../Lang/LocalizeExternText';
import UIManager from './UIManager';

export default class FoodManager extends ZepetoScriptBehaviour {
    /* UIs */
    @Header("UIs")
    @SerializeField() foodPopup : Image;
    @SerializeField() foodImage : Image;
    @SerializeField() buyBtn : Button;
    @SerializeField() cancelBtn : Button;
    @SerializeField() foodRemoveBtn : Button;
    @SerializeField() purchaseText : Text;

    @Header("Food Sprites")
    @SerializeField() tteokbokkiSprite : Sprite;
    @SerializeField() rawMeatSprite : Sprite;
    @SerializeField() jeonSprite : Sprite;
    @SerializeField() bibimSprite : Sprite;
    @SerializeField() chickenSprite : Sprite;
    @SerializeField() twistedBreadSprite : Sprite;

    /* GameObjects */
    @Header("GameObjects")
    @SerializeField() tteokbokkiPrefab : GameObject;
    @SerializeField() rawMeatPrefab : GameObject;
    @SerializeField() jeonPrefab : GameObject;
    @SerializeField() bibimPrefab : GameObject;
    @SerializeField() chickenPrefab : GameObject;
    @SerializeField() twistedBreadPrefab : GameObject;

    @Header("Attached Body Bone")
    @SerializeField() private bodyBone : HumanBodyBones;

    /* Properties */
    private selectedFood : GameObject;
    private selectedSprite : Sprite;
    private foodName : string;
    private purchaseAttachedStr : string;
    private foodDatas : Map<string, GameObject> = new Map<string, GameObject>();
    private equippDatas : Map<string, GameObject> = new Map<string, GameObject>();
    private price : number = 10;

    private get PurchaseStr() : string { return `${this.foodName} ${this.purchaseAttachedStr}`; }

    Start() {
        this.foodDatas.set(this.tteokbokkiPrefab.name, this.tteokbokkiPrefab);
        this.foodDatas.set(this.rawMeatPrefab.name, this.rawMeatPrefab);
        this.foodDatas.set(this.jeonPrefab.name, this.jeonPrefab);
        this.foodDatas.set(this.bibimPrefab.name, this.bibimPrefab);
        this.foodDatas.set(this.chickenPrefab.name, this.chickenPrefab);
        this.foodDatas.set(this.twistedBreadPrefab.name, this.twistedBreadPrefab);

        this.buyBtn.onClick.AddListener(() => {
            this.BuyFood();
        });

        this.cancelBtn.onClick.AddListener(() => {
            this.foodPopup.gameObject.SetActive(false);
        });

        this.foodRemoveBtn.onClick.AddListener(() => {
            this.RemoveFood();
        })
    }

    public OpenPurchaseUI(foodType : InteractionType) {
        this.foodPopup.gameObject.SetActive(true);
        const localText = this.purchaseText.GetComponent<LocalizeExternText>();
        switch (foodType) {
            case InteractionType.Ttekbokki:
                this.selectedFood = this.tteokbokkiPrefab;
                this.selectedSprite = this.tteokbokkiSprite;
                this.foodName = `"${localText.GetTextInArray(3)}"`;
                break;
            case InteractionType.RawMeat:
                this.selectedFood = this.rawMeatPrefab;
                this.selectedSprite = this.rawMeatSprite;
                this.foodName = `"${localText.GetArrayText(2)}"`;
                break;
            case InteractionType.Jeon:
                this.selectedFood = this.jeonPrefab;
                this.selectedSprite = this.jeonSprite;
                this.foodName = `"${localText.GetArrayText(4)}"`;
                break;       
            case InteractionType.Bibim:
                this.selectedFood = this.bibimPrefab;
                this.selectedSprite = this.bibimSprite;
                this.foodName = `"${localText.GetArrayText(6)}"`;
                break;
            case InteractionType.Chicken:
                this.selectedFood = this.chickenPrefab;
                this.selectedSprite = this.chickenSprite;
                this.foodName = `"${localText.GetArrayText(5)}"`;
                break;
            case InteractionType.TwistedBread:
                this.selectedFood = this.twistedBreadPrefab;
                this.selectedSprite = this.twistedBreadSprite;
                this.foodName = `"${localText.GetArrayText(1)}"`;
                break;
            default:
                break;
        }
        this.purchaseText.text = this.StringFormat();
        this.foodImage.sprite = this.selectedSprite;
    }
    
    private StringFormat() : string{
        const localText = this.purchaseText.GetComponent<LocalizeExternText>();
        let defaultText = localText.GetTextInArray(0);
        const name = this.foodName;
        defaultText = defaultText.replace("InputFood", name);
        console.log(defaultText);
        return defaultText;
    }

    // client method
    public CheckEquipped() {
        const sessionId = MultiplayManager.instance.Room.SessionId;
        return this.equippDatas.has(sessionId);
    }

    private BuyFood() {
        this.foodPopup.gameObject.SetActive(false);
        this.foodRemoveBtn.gameObject.SetActive(true);

        if (!GameManager.instance.UseCoin(this.price)) return;
        UIManager.instance.GetGiftController().MikeOff();
        const data = new RoomData();
        data.Add(SendName.FoodType, this.selectedFood.name);
        MultiplayManager.instance.Room.Send(MESSAGE.FoodEquipp, data.GetObject());
        
    }
    
    public RemoveFood() {
        this.foodRemoveBtn.gameObject.SetActive(false);
        const data = new RoomData();
        data.Add(SendName.SessionId, MultiplayManager.instance.Room.SessionId);
        MultiplayManager.instance.Room.Send(MESSAGE.FoodUnequipp, data.GetObject());
    }

    // server receive method    
    public OnBuyFood(sessionId : string, foodName : string) {
        Debug.Log("equipped " + foodName);
        const boneTransform = AnimationManager.GetBone(sessionId, this.bodyBone);
        const food = this.foodDatas.get(foodName);
        const equippedFood : GameObject = GameObject.Instantiate<GameObject>(food, boneTransform);
        equippedFood.transform.localPosition = new Vector3(0.075, 0.05, -0.022);
        // equippedFood.transform.localRotation = Quaternion.Euler(180, 0, 180);
        AnimationManager.SetCharacterAnimation(sessionId, AnimParamType.Bool,AnimParamName.FoodHold, true);

        this.equippDatas.set(sessionId, equippedFood);
    }

    public OnRemoveFood(sessionId : string) {
        const food = this.equippDatas.get(sessionId);
        if(food) {
            Debug.Log("Unequipped" + food.name);
            GameObject.Destroy(food);
            AnimationManager.SetCharacterAnimation(sessionId, AnimParamType.Bool, AnimParamName.FoodHold, false);
            this.equippDatas.delete(sessionId);
        }
    }
}
