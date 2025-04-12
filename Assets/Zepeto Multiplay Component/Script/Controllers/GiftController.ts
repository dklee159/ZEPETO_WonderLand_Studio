import { Toggle } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { EquipList } from '../TypeManager';
import EquipManager from '../Manager/EquipManager';
import { GameObject } from 'UnityEngine';
import FoodManager from '../Manager/FoodManager';

export default class GiftController extends ZepetoScriptBehaviour {
    @SerializeField() private mike_1 : Toggle;
    @SerializeField() private mike_2 : Toggle;
    @SerializeField() private head : Toggle;
    @SerializeField() private neck_1 : Toggle;
    @SerializeField() private neck_2 : Toggle;

    @SerializeField() private foodManager : GameObject;

    Start() {    
        this.mike_1.onValueChanged.AddListener(() => {
            if(!this.mike_1.isOn)
                EquipManager.instance.UnequipItem(EquipList.AwardsMike_1);
            else {
                this.foodManager.GetComponent<FoodManager>().RemoveFood();
                EquipManager.instance.EquipItem(EquipList.AwardsMike_1);
            }
        });
        this.mike_2.onValueChanged.AddListener(() => {
            if(!this.mike_2.isOn) 
                EquipManager.instance.UnequipItem(EquipList.AwardsMike_2);
            else {
                this.foodManager.GetComponent<FoodManager>().RemoveFood();
                EquipManager.instance.EquipItem(EquipList.AwardsMike_2);
            }
        }); 
        this.head.onValueChanged.AddListener(() => {
            if(!this.head.isOn) EquipManager.instance.UnequipItem(EquipList.AwardsHead);
            else EquipManager.instance.EquipItem(EquipList.AwardsHead);
        }); 
        this.neck_1.onValueChanged.AddListener(() => {
            if(!this.neck_1.isOn) EquipManager.instance.UnequipItem(EquipList.AwardsNeck_1);
            else EquipManager.instance.EquipItem(EquipList.AwardsNeck_1);
        }); 
        this.neck_2.onValueChanged.AddListener(() => {
            if(!this.neck_2.isOn) EquipManager.instance.UnequipItem(EquipList.AwardsNeck_2);
            else EquipManager.instance.EquipItem(EquipList.AwardsNeck_2);
        }); 
    }

    public MikeOff() {
        if(this.mike_1.isOn) this.mike_1.isOn = false;
        if(this.mike_2.isOn) this.mike_2.isOn = false;
    }

    public SetInteractable(canInteractable : boolean) {
        this.mike_1.interactable = canInteractable
        this.mike_2.interactable = canInteractable;
        this.head.interactable = canInteractable;
        this.neck_1.interactable = canInteractable;
        this.neck_2.interactable = canInteractable;
    }
}