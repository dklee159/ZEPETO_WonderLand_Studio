import { TextMeshPro, TextMeshProUGUI } from 'TMPro';
import { Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ERROR } from '../TypeManager';
import TranslateManager from './TranslateManager';

export default class LocalizeExternText extends ZepetoScriptBehaviour {
    @SerializeField() private textIndex: number = 0;

    @Header("Support - Index")
    @SerializeField() private supportHead: boolean = false;
    @SerializeField() private supportTail: boolean = false;
    @SerializeField() private headText: string;
    @SerializeField() private tailText: string;
    
    @Header("Array")
    @SerializeField() private isArray: boolean = false;
    @SerializeField() protected indexs: number[] = [];

    private _textList: string[] = [];
    public get textList(): string[] { return this._textList; }
    private set textList(value: string[]) { this._textList = value; }

    private _text : string;
    public get text(): string { return this._text; }
    public set text(value : string) { this._text = value; }

    protected isStarted: boolean = false;

    Awake() {
        this.onStart();
    }

    // public RemoteStart() {
    //     //
    //     this.onStart();
    // }

    protected onStart() {
        if(this.isStarted) return;
        this.isStarted = true;
        this.text = TranslateManager.GetText(this.textIndex);
        if (this.gameObject.TryGetComponent<Text>(null)) {
            this.gameObject.GetComponent<Text>().text = this.SupportText(TranslateManager.GetText(this.textIndex));
        } else if (this.gameObject.TryGetComponent<TextMeshPro>(null)) {
            this.gameObject.GetComponent<TextMeshPro>().text = this.SupportText(TranslateManager.GetText(this.textIndex));
        } else if (this.gameObject.TryGetComponent<TextMeshProUGUI>(null)) {
            this.gameObject.GetComponent<TextMeshProUGUI>().text = this.SupportText(TranslateManager.GetText(this.textIndex));
        } else {
            console.error(ERROR.TRANSLATE_NOT_FOUND);
        }

        // Array
        if(!this.isArray) return;
        for(const index of this.indexs) {
            const text = TranslateManager.GetText(index);
            this.textList.push(text);
        }
    }

    public DebugStart() {
        if (this.gameObject.TryGetComponent<Text>(null)) {
            this.gameObject.GetComponent<Text>().text = this.SupportText(TranslateManager.GetText(this.textIndex));
        } else if (this.gameObject.TryGetComponent<TextMeshPro>(null)) {
            this.gameObject.GetComponent<TextMeshPro>().text = this.SupportText(TranslateManager.GetText(this.textIndex));
        } else if (this.gameObject.TryGetComponent<TextMeshProUGUI>(null)) {
            this.gameObject.GetComponent<TextMeshProUGUI>().text = this.SupportText(TranslateManager.GetText(this.textIndex));
        } else {
            console.error(ERROR.TRANSLATE_NOT_FOUND);
        }

        // Array
        if(!this.isArray) return;
        for(const index of this.indexs) {
            const text = TranslateManager.GetText(index);
            this.textList.push(text);
        }
    }

    private SupportText(text:string) {
        if(this.supportHead) text = this.headText.concat(text);
        if(this.supportTail) text = text.concat(this.tailText);
        return text;
    }

    public GetArrayText(...index : number[]) : string[]{
        let arrText : string[] = [];

        for (const i of index) {
            arrText.push(this.textList[i]);
        }
        return arrText;
    }

    public GetTextInArray(index) {
        if(!this.isStarted) this.onStart();
        return this.textList[index];
    }
}