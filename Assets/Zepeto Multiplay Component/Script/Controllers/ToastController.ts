import { TextMeshProUGUI } from 'TMPro';
import { GameObject, Transform, WaitForSeconds } from 'UnityEngine';
import { Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { TOAST_MESSAGE } from '../TypeManager';

export default class ToastController extends ZepetoScriptBehaviour {

    /* Objects */
    @SerializeField() private toastErrorMessage: GameObject;
    @SerializeField() private toastSuccessMessage: GameObject;
    @SerializeField() private mainCanvas: Transform;
    @SerializeField() private animationCanvas: Transform;
    @SerializeField() private textAnimation_Text: TextMeshProUGUI;
    @SerializeField() private textAnimation: Animation;
    @SerializeField() private textAnimation_OneSec_Text: TextMeshProUGUI;
    @SerializeField() private textAnimation_OneSec: Animation;
    private waitForSecond: WaitForSeconds;

    public Toast(text:string, activeMainCanvas:boolean) {
        this.StartCoroutine(this.ShowToastMessage(text, activeMainCanvas));
    }

    private * ShowToastMessage(text:string, activeMainCanvas:boolean) {
        if(!this.waitForSecond) this.waitForSecond = new WaitForSeconds(1);
        yield this.waitForSecond;

        // Choice Target
        const isFailed = (text == TOAST_MESSAGE.feedFailed);
        const targetMessgae = isFailed ? this.toastErrorMessage : this.toastSuccessMessage;

        // Instantiate GameObject
        const toastMessage:GameObject = GameObject.Instantiate<GameObject>(targetMessgae);
        toastMessage.transform.SetParent(activeMainCanvas ? this.mainCanvas :this.animationCanvas);

        // Set Target Text
        toastMessage.GetComponentInChildren<Text>().text = text;

        // Finish
        GameObject.Destroy(toastMessage, 1);
    }
}