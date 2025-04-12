import { Vector3, Transform, WaitForEndOfFrame, WaitForSeconds, HumanBodyBones, Animator } from 'UnityEngine';
import { ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import MultiplayManager from '../../ZepetoScript/Common/MultiplayManager';
import { RoomData } from 'ZEPETO.Multiplay';
import { MESSAGE } from '../TypeManager';
import AnimationManager, { AnimParamName, AnimParamType } from '../Manager/AnimationManager';
import InteractionBtn from '../Interaction/InteractionBtn';

export default class ChairController extends ZepetoScriptBehaviour {
    private bodyBone: HumanBodyBones = HumanBodyBones.Hips;

    private _playerGesturePosition : Vector3;
    private isSit : boolean;
    private charcter : ZepetoCharacter;
    private sitTransform : Transform;
    private chairId : string;
    private interactionBtn : InteractionBtn;

    private get ChairId () : string { return this.chairId + "Chair"; }

    Start() {
        this.interactionBtn = this.GetComponent<InteractionBtn>();
        this.sitTransform = this.transform;
        this.chairId = `${this.gameObject.name}_${this.transform.parent.name}`;

        MultiplayManager.instance.multiplay.RoomJoined +=(room) => {
            room.AddMessageHandler(this.ChairId, (message : any) => {
                const sessionId = message.SessionId;
                const isSit = message.IsSit;
                this.OnSit(sessionId, isSit);
            });
        }

    }

    public SitOnChair() {
        if (this.isSit) return;
        this.isSit = true;
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;

        const data = new RoomData();
        data.Add("chairId", this.ChairId);
        data.Add("isSit", true);
        // character.Teleport(this.sitTransform.position, this.sitTransform.rotation);
        
        MultiplayManager.instance.Room.Send(MESSAGE.ChairSit, data.GetObject());
    }

    public * CheckTryMove() {
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;

        const animator: Animator = character.ZepetoAnimator;
        const bone: Transform = animator.GetBoneTransform(this.bodyBone);
        console.log(bone);
        console.log(character.transform.position)
        let idx = 0;
        
        while(true) {
            if(character.tryJump || character.tryMove) break;

            const distance = Vector3.op_Subtraction(bone.position, character.transform.position);
            const newPos: Vector3 = Vector3.op_Subtraction(this.sitTransform.position, distance);
            
            this._playerGesturePosition = newPos;
            character.transform.position = this._playerGesturePosition;
            character.transform.rotation = this.sitTransform.rotation;
            yield new WaitForEndOfFrame();
            yield WaitForEndOfFrame;
        }

        const data = new RoomData();
        data.Add("chairId", this.ChairId);
        data.Add("isSit", false);

        MultiplayManager.instance.Room.Send(MESSAGE.ChairSit, data.GetObject());
    }

    public OnSit(sessionId : string, isSit : boolean) {
        if (isSit) {
            this.interactionBtn.canShow = false;
            this.interactionBtn.HideIcon();
            this.StartCoroutine(this.PlaySitAnimation(sessionId));
        }
        else {
            this.interactionBtn.canShow = true;
            this.StopCoroutine(this.CheckTryMove);
            AnimationManager.SetCharacterAnimation(sessionId, AnimParamType.Bool, AnimParamName.IsSit, false);
        }
        this.isSit = isSit;
    }

    private * PlaySitAnimation(sessionId) {
        const character = ZepetoPlayers.instance.GetPlayer(sessionId).character;
        const anim = character.ZepetoAnimator;

        console.log("play sit animation");

        AnimationManager.SetCharacterAnimation(sessionId, AnimParamType.Bool, AnimParamName.IsSit, true);

        // check local player tring to move
        if (sessionId == MultiplayManager.instance.room.SessionId) {
            this.StartCoroutine(this.CheckTryMove());
        }
    }
}