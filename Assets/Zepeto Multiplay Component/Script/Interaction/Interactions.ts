import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GameObject } from 'UnityEngine';
import InteractionController from './InteractionController';
import InteractionBtn from '../InteractionBtn';



export default class Interactions extends ZepetoScriptBehaviour {

    @SerializeField() private _interactionType: InteractionType;
    private _interactionBtn: InteractionBtn;
    
    Start() {    
        this._interactionBtn = this.GetComponent<InteractionBtn>();        
        this._interactionBtn.onClickEvent.AddListener(() => {
            this._interactionBtn.HideIcon();
            this.DoInteraction();
        })
    }

    private DoInteraction() {
        switch (this._interactionType) {
            case (InteractionType.AnimInteraction):
                this.GetComponent<InteractionController>().SendSignal();
                break;
        }
    }
}

export enum InteractionType {
    AnimInteraction
}