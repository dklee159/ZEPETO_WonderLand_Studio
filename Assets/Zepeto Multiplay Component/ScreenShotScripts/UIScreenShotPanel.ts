import { TextMeshProUGUI } from 'TMPro';
import { Coroutine, GameObject, WaitForSeconds, WaitWhile } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from '../Script/GameManager';
import QuestManager from '../Script/Manager/QuestManager';
import { TOAST_MESSAGE } from '../Script/TypeManager';
import { TimeSpan } from './TimeSpan';
import WorldVideoRecorderExample from './WorldVideoRecorderExample';

export default class UIScreenShotPanel extends ZepetoScriptBehaviour {
    public shoot : Button;
    public viewChange : Button;


    public readyPanel : GameObject; 
    public recordStart : Button;
    public recording : Button;    
    public recordRing : Image;
    public exitButton : Button;

    public afterRecordPanel : GameObject; 
    public recordSave : Button;
    public recordShare : Button;
    public recordFeed : Button;
    public recordingClose : Button;

    public timePanel : GameObject; 
    public recordTimeLabel :TextMeshProUGUI;

    public worldVideoRecorderObject : GameObject;
    private worldVideoRecorder : WorldVideoRecorderExample;

    public totalRecordTime : int = 60;    
    private tsPlayTime : TimeSpan = null;

    private _ringCoroutine : Coroutine = null;
    

    Start() {    

        this.worldVideoRecorder = this.worldVideoRecorderObject.GetComponent<WorldVideoRecorderExample>();

        this.recordStart?.onClick.AddListener(() => {
            this.StartRecording();
        });


        this.recording?.onClick.AddListener(() => {
            this.StopRecording();
        });


        this.exitButton?.onClick.AddListener(() => {
            //this.StopRecording();
            this.ForceStop();    
        });

        this.recordingClose?.onClick.AddListener(() => {
            this.Init();
        });


        this.recordSave?.onClick.AddListener(() => {            
            this.worldVideoRecorder.SaveVideo();
            this.recordSave.interactable = false;
        });

        this.recordShare?.onClick.AddListener(() => {
            this.worldVideoRecorder.ShareVideo();
        });

        this.recordFeed?.onClick.AddListener(() => {
            this.worldVideoRecorder.CreateFeed();
            this.recordFeed.interactable = false;
            QuestManager.Instance.OnPostFeed();
            GameManager.instance.Toast(TOAST_MESSAGE.feedUploading);
            this.StartCoroutine(this.Feed());
        });       

    }


    *Feed() {
        yield new WaitWhile(() => this.worldVideoRecorder.IsFeed);
        this.recordFeed.interactable = true;
    }


    OnEnable() {
        this.Init();    
    }


    StartRecording() 
    {
        const ret = this.worldVideoRecorder.StartRecording();
        if( ret == true ) {

            this.shoot.interactable = false;
            this.viewChange.interactable = false;

            this.recordStart.gameObject.SetActive(false);
            this.recording.gameObject.SetActive(true);
            this.timePanel.SetActive(true);

            if( this._ringCoroutine != null ) {
                this.StopCoroutine(  this._ringCoroutine );
                this._ringCoroutine = null;
            }
            this._ringCoroutine = this.StartCoroutine(this.IncreaseRecordRing());    
        }
    }

    StopRecording()
    {
        console.log("@@@@@@@ timeout stop record 1");
        const ret = this.worldVideoRecorder.StopRecording();
        //if( ret == true ) {
            console.log("@@@@@@@ timeout stop record 2");
            this.recordStart.gameObject.SetActive(true);
            this.recording.gameObject.SetActive(false);

            this.shoot.interactable = true;
            this.viewChange.interactable = true;

            this.readyPanel.gameObject.SetActive(false);
            this.afterRecordPanel.gameObject.SetActive(true);
            this.recordSave.interactable = true;

            if( this._ringCoroutine != null ) {
                this.StopCoroutine(  this._ringCoroutine );
                this._ringCoroutine = null;
            }
        //}
    }

    ForceStop()
    {        
        console.log("@@@@@@@ ForceStop stop record");
        this.worldVideoRecorder.StopRecording();
        if( this._ringCoroutine != null ) {
            this.StopCoroutine(  this._ringCoroutine );
            this._ringCoroutine = null;
        }


        
        this.recordStart.gameObject.SetActive(true);
        this.recording.gameObject.SetActive(false);

        this.shoot.interactable = true;
        this.viewChange.interactable = true;

    }


    Init() {
        this.shoot.interactable = true;
        this.viewChange.interactable = true;


        this.afterRecordPanel.SetActive(false);
        this.readyPanel.SetActive(true);
        this.timePanel.SetActive(false);
        this.recording.gameObject.SetActive(false);

        this.recordRing.fillAmount = 0;

        this.StopAllCoroutines();
        this._ringCoroutine = null ;
    }


    private * IncreaseRecordRing() {
        let timegap = 0.01;
        //this.tsPlayTime = TimeSpan.fromSeconds(this.totalRecordTime);        
        this.tsPlayTime = TimeSpan.fromMilliseconds(0);        
        
        const totalTimeMS = 1000 * this.totalRecordTime;
        const tsTimeGap = TimeSpan.fromMilliseconds(timegap * 1000);
        const wait = new WaitForSeconds(timegap);

        let sec = '';
        let msec = '';

        this.recordRing.fillAmount = 0;

        while (true) {
            sec = this.tsPlayTime.seconds.toString().padStart(2, "0");
            msec = (this.tsPlayTime.milliseconds / 10).toString().padStart(2, "0");          
            this.recordTimeLabel.text = `${sec}:${msec}`;

            yield wait;

            //this.tsPlayTime = this.tsPlayTime.subtract(tsTimeGap);
            this.tsPlayTime = this.tsPlayTime.add(tsTimeGap);
            if (this.tsPlayTime.totalSeconds >= 60 ) {
                break;
            }

            const playRatio =  this.tsPlayTime.totalMilliseconds / totalTimeMS;
            this.recordRing.fillAmount = playRatio;
        }

        console.log("!!!!!! timeout stop record ");
        this._ringCoroutine = null;
        this.StopRecording();
        
    }







}