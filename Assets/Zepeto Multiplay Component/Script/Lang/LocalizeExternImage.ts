import { Sprite } from 'UnityEngine';
import { Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import TranslateManager from './TranslateManager'
import LocalizeExternText from './LocalizeExternText';
import DebugController from "../Controllers/DebugController";

export default class LocalizeExternImage extends LocalizeExternText {
    @SerializeField() sprites : Sprite[] = [];
    
    Start() {    
        this.onStart();
    }

    protected onStart() {
        if (this.isStarted) return;
        this.isStarted = true;

        console.log("start image localize");
        this.gameObject.GetComponent<Image>().sprite = this.sprites[TranslateManager.nowSystemLanguage - 1];
        // if (this.gameObject.TryGetComponent<Image>(null)) {
        // }
    }

    public override DebugStart() {
        console.log("start image localize");
        this.gameObject.GetComponent<Image>().sprite = this.sprites[TranslateManager.nowSystemLanguage - 1];
        // if (this.gameObject.TryGetComponent<Image>(null)) {
        // }
    }
}