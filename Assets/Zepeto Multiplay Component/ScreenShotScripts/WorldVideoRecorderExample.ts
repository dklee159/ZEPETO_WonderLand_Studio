import { BooleanLiteral } from 'typescript';
import { Camera, GameObject, RenderTexture, WaitForEndOfFrame, WaitForSeconds, WaitWhile } from 'UnityEngine';
import { Button, RawImage, Image } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { VideoResolutions, WorldVideoRecorder } from 'ZEPETO.World';
import GameManager from '../Script/GameManager';
import { Datas, TOAST_MESSAGE } from '../Script/TypeManager';

export default class WorldVideoRecorderExample extends ZepetoScriptBehaviour {

    public thumbnailImage: RawImage;

    public srcCamera: Camera;
    public recorderCamera: Camera;
    public targetTexture: RenderTexture;

    // VideoPlayer Object 
    private videoPlayerObject: GameObject;

    private _isFeed: bool = false;
    public get IsFeed(): bool {
        return this._isFeed;
    }

    private _waitFrame: WaitForEndOfFrame = new WaitForEndOfFrame();
    private _wait1s: WaitForSeconds = new WaitForSeconds(1);

    Awake() {
        this.videoPlayerObject = new GameObject();
    }

    Start() {
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.srcCamera = ZepetoPlayers.instance.LocalPlayer.zepetoCamera.camera;
        });

        this.recorderCamera.gameObject.SetActive(false);
    }
 

    public StartRecording() : boolean {
        this.recorderCamera.gameObject.SetActive(true);
        this.StopAllCoroutines();

        this.StartCoroutine(this.CameraFollow());

        console.log("!!!!!! StartRecording ");
        if (false == WorldVideoRecorder.StartRecording(this.recorderCamera, VideoResolutions.W1280xH720, 60)) {
            console.log("!!!!!! StartRecording FAIL!!!");
            return false;
        }

        this.StartCoroutine(this.CheckRecording());
        return true;
    };

    public StopRecording() {
        if (false == WorldVideoRecorder.IsRecording()) {
            return false;
        }
        WorldVideoRecorder.StopRecording();
        this.StartCoroutine(this.DisableCam());
        return true;
    }

    public SaveVideo() {
        if(WorldVideoRecorder.IsRecording() == false) {
            WorldVideoRecorder.SaveToCameraRoll(result => {      
                GameManager.instance.Toast(TOAST_MESSAGE.screenShotSaveCompleted);     
            });            
        }
    }

    public ShareVideo()  {
        if(WorldVideoRecorder.IsRecording() == false) {
            WorldVideoRecorder.Share(result => {
                console.log(`!!!!!! Share Video result ${result}`);
            });
        }
    }

    public CreateFeed()  {
        if(WorldVideoRecorder.IsRecording() == false) {
            this._isFeed = true;
            WorldVideoRecorder.CreateFeed(Datas.FeedMessage, result => {
                this.ShowCreateFeedResult(result);
                this._isFeed = false;
            });
        }
    }

    public GetThumbnail() {
        if(WorldVideoRecorder.IsRecording() == false) {
            this.thumbnailImage.texture = WorldVideoRecorder.GetThumbnail();
        }
    }


    private * DisableCam(isEnable:boolean = false) {
        yield null;
        this.recorderCamera.gameObject.SetActive(isEnable);

        if(isEnable == false) this.StopAllCoroutines();
    }


    private * CheckRecording() {
        yield this._waitFrame;
        while (WorldVideoRecorder.IsRecording()) {
            yield this._waitFrame;
        }

        const videoPlayer = WorldVideoRecorder.AddVideoPlayerComponent(this.videoPlayerObject, this.targetTexture);
        if (videoPlayer == null) {
            return;
        }
        videoPlayer.Play();
    }

    private * CameraFollow() {
        while(true) {
            this.recorderCamera.transform.position = this.srcCamera.transform.position;
            this.recorderCamera.transform.rotation = this.srcCamera.transform.rotation;
            yield this._waitFrame;
        }
    }


        // Displays the screenshot results screen.
    public ShowCreateFeedResult(result: Boolean) {
        if (result) GameManager.instance.Toast(TOAST_MESSAGE.feedCompleted);
        else        GameManager.instance.Toast(TOAST_MESSAGE.feedFailed);
    }
}








