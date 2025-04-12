import { HumanBodyBones, Transform } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class AnimationManager extends ZepetoScriptBehaviour {
    public static SetCharacterAnimation(sessionId : string, paramType : AnimParamType, paramName : AnimParamName, value : any) {
        const animator = ZepetoPlayers.instance.GetPlayer(sessionId).character.ZepetoAnimator;
        switch (paramType) {
            case AnimParamType.Bool:
                animator.SetBool(paramName, value);
                break;
            case AnimParamType.Int:
                animator.SetInteger(paramName, value);
                break;
            default:
                break;
        }
    }

    public static SetWonderAnimation(wonderState : WonderState) {
        const animator = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator;
        animator.SetInteger(AnimParamName.WonderState, wonderState);
    }

    public static StopWonderAnimation() {
        const animator = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator;
        animator.SetInteger(AnimParamName.WonderState, 0);
    }

    public static GetBone(sessionId : string, bone : HumanBodyBones) : Transform {
        const animator = ZepetoPlayers.instance.GetPlayer(sessionId).character.ZepetoAnimator;
        return animator.GetBoneTransform(bone);
    }
}

export enum WonderState {
    NONE = 0,
    Hold_RightHand_Upper = 51, Hold_RightHand_Side = 52,

    /** Wonder **/

    // Panel Button
    Panel_Pose_1 = 131, Panel_Pose_2 = 132, Panel_Pose_3 = 133,
    Panel_LOCK_Pose_1 = 134, Panel_LOCK_Pose_2 = 135, Panel_LOCK_Pose_3 = 136,

    // PhotoBooth
    High_Pose_1 = 301, High_Pose_2 = 302, High_Pose_3 = 303, High_Pose_4 = 304, High_Pose_5 = 305, High_Pose_6 = 306, High_Pose_7 = 307, High_Pose_8 = 308, High_Pose_9 = 309, High_Pose_10 = 310,

    Front_Pose_1 = 401, Front_Pose_2 = 402, Front_Pose_3 = 403, Front_Pose_4 = 404, Front_Pose_5 = 405, Front_Pose_6 = 406, Front_Pose_7 = 407, Front_Pose_8 = 408,

    Low_Pose_1 = 501, Low_Pose_2 = 502, Low_Pose_3 = 503, Low_Pose_4 = 504, Low_Pose_5 = 505, Low_Pose_6 = 506, Low_Pose_7 = 507, Low_Pose_8 = 508,
}

export enum AnimParamName {
    Jetski = "isJetskiRiding",
    FoodHold = "isHold",
    WonderState = "WonderState",
    PhotoBooth = "PhotoBooth",
    IsSit = "isSit",
}

export enum AnimParamType {
    Bool = "AnimBool",
    Int = "AnimInteger"
}
