import { AnimationClip, GameObject, Transform, WaitForSeconds } from 'UnityEngine';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { OfficialContentType, WorldService, ZepetoWorldContent, Content } from 'ZEPETO.World';
import SyncIndexManager from '../../ZepetoScript/Common/SyncIndexManager';
import MultiplayManager from '../../ZepetoScript/Common/MultiplayManager';
import { SendName, MESSAGE } from '../TypeManager';
import InteractionBtn from '../Interaction/InteractionBtn';
import { TextMeshProUGUI, TextMeshPro } from 'TMPro';

export default class BuskingZoneManager extends ZepetoScriptBehaviour {
    private content : Content;
    private animClip : AnimationClip;
    @SerializeField() private buskingPoint_1 : Transform;
    @SerializeField() private buskingPoint_2 : Transform;
    @SerializeField() private buskingInteraction_1 : Transform;
    @SerializeField() private buskingInteraction_2 : Transform;
    @SerializeField() private heartInteraction_1 : Transform;
    @SerializeField() private heartInteraction_2 : Transform;
    @SerializeField() private heartText_1 : TextMeshPro;
    @SerializeField() private heartText_2 : TextMeshPro;

    /* Properties */
    private isPoint1Play : boolean = false;
    private isPoint2Play : boolean = false;
    private heartNum_1 : number;
    private heartNum_2 : number;

    private readonly gestureName = "리듬댄스";

    /* Getter Setter */
    public get HeartNum_1() : number { return this.heartNum_1; }
    public get HeartNum_2() : number { return this.heartNum_2; }
    public set HeartNum_1(value : number) { 
        this.heartNum_1 = value;
        if (value == -1) {
            this.heartText_1.gameObject.SetActive(false);
        }
        else {
            this.heartText_1.gameObject.SetActive(true);
            this.heartText_1.text = value.toString();
        }
    }
    public set HeartNum_2(value : number) { 
        this.heartNum_2 = value;
        if (value == -1) {
            this.heartText_2.gameObject.SetActive(false);
        }
        else {
            this.heartText_2.gameObject.SetActive(true);
            this.heartText_2.text = value.toString();
        }
    }

    Start() {    
        ZepetoWorldContent.RequestOfficialContentList(OfficialContentType.All, contents => {
            for(const con of contents) {
                if(con.Title == this.gestureName) {
                    this.content = con;
                    con.DownloadAnimation(() => {
                        this.animClip = con.AnimationClip;
                    });
                    break;
                }
            }
        });
    }

    private StartGesture() {
        const _myCharacter = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character
        if (!this.animClip) {
            this.content.DownloadAnimation(() => {
                this.animClip = this.content.AnimationClip;
                _myCharacter.SetGesture(this.animClip);
            });
        } else {
            _myCharacter.SetGesture(this.animClip);
        }
    }

    public BuskingIsStart(pointNum : number, isStart : boolean) {
        const data = new RoomData();
        data.Add("Point", pointNum);
        data.Add("IsStart", isStart);

        if (isStart) {
            this.StartCoroutine(this.BuskingStart(pointNum));
        }
        else {

        }

        MultiplayManager.instance.Room.Send(MESSAGE.Busking, data.GetObject());
    }

    private * BuskingStart(pointNum : number) {
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        if (pointNum == 1) {
            // character.transform.position = this.buskingPoint_1.position;
            // character.transform.rotation = this.buskingPoint_2.rotation;
            character.Teleport(this.buskingPoint_1.position, this.buskingPoint_1.rotation);
        }
        else {
            character.Teleport(this.buskingPoint_2.position, this.buskingPoint_2.rotation);
        }
        
        yield new WaitForSeconds(1);

        this.StartGesture();

        while (true) {
            if(character.tryJump || character.tryMove) break;
            yield null;
        }
        character.ZepetoAnimator.SetInteger("State", 1);
        this.BuskingIsStart(pointNum, false);
    }

    public OnBuskingIsStart(pointNum : number, isStart : boolean) {
        console.log("clinet receive");
        if (pointNum == 1) {
            this.isPoint1Play = isStart;
            this.buskingInteraction_1.gameObject.SetActive(!isStart);
            this.heartInteraction_1.gameObject.SetActive(isStart);
            if (isStart) {
                this.HeartNum_1 = 0;  
            }
            else {
                this.HeartNum_1 = -1;
            }
        }
        else {
            this.isPoint2Play = isStart;
            this.buskingInteraction_2.gameObject.SetActive(!isStart);
            this.heartInteraction_2.gameObject.SetActive(isStart);
            if (isStart) {
                this.HeartNum_2 = 0;  
            } 
            else {
                this.HeartNum_2 = -1;
            }
        }
    }

    public SendAddHeart(pointNum : number) {
        const data = new RoomData();
        data.Add("Point", pointNum);

        MultiplayManager.instance.Room.Send(MESSAGE.BuskingHeart, data.GetObject());
    }

    public AddHeart(pointNum : number) {
        if (pointNum == 1 && this.isPoint1Play) {
            this.HeartNum_1++;
        }
        else if (pointNum == 2 && this.isPoint1Play) {
            this.HeartNum_2++;
        }
    }
}
