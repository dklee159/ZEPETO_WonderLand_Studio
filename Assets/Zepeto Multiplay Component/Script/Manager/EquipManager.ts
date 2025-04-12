import { Animator, GameObject, Transform, HumanBodyBones } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Anim, EquipList, MESSAGE } from '../TypeManager';
import MultiplayManager from '../../ZepetoScript/Common/MultiplayManager';
import { RoomData } from 'ZEPETO.Multiplay';

export default class EquipManager extends ZepetoScriptBehaviour {

    /* Singleton */
    private static _instance: EquipManager;
    public static get instance(): EquipManager {
        if (!EquipManager._instance) {
            const managerObj = GameObject.Find("EquipManager");
            if (managerObj) EquipManager._instance = managerObj.GetComponent<EquipManager>();
        }
        return EquipManager._instance;
    }

    @Header("Head")
    @SerializeField() private headItems : GameObject[] = [];

    @Header("Right Hand")
    @SerializeField() private rightHandItems : GameObject[] = [];

    @Header("Neck")
    @SerializeField() private neckItems : GameObject[] = [];

    private equipMap : Map<string, CurrentEquip> = new Map<string, CurrentEquip>();

    Awake() {
        EquipManager._instance = this;        
    }

    Start() {
        ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId) => {
            this.equipMap.set(sessionId, {
                Head : null,
                RightHand : null,
                Neck : null,
            });
        });

        ZepetoPlayers.instance.OnRemovedPlayer.AddListener((sessionId) => {
            this.equipMap.delete(sessionId);
        });

        MultiplayManager.instance.multiplay.RoomJoined += room => {
            room.AddMessageHandler(MESSAGE.EquipItem, (itemData : any) => {
                const { SessionId, Bone, ItemIndex } = itemData;

                this.OnEquipItem(SessionId.toString(), Bone as HumanBodyBones, ItemIndex);
            });
            room.AddMessageHandler(MESSAGE.UnequipItem, (itemData : any) => {
                const { SessionId, Bone } = itemData;
                this.OnUnequipItem(SessionId.toString(), Bone as HumanBodyBones);
            });
            room.AddMessageHandler(MESSAGE.VisibleItem, (itemData : any) => {
                const { SessionId, Bone } = itemData;
                this.OnVisible(SessionId.toString(), Bone as HumanBodyBones);
            });
            room.AddMessageHandler(MESSAGE.InvisibleItem, (itemData : any) => {
                const { SessionId, Bone } = itemData;
                this.OnInvisible(SessionId.toString(), Bone as HumanBodyBones);
            });
        }
    }

    public InitEquipData() {
        MultiplayManager.instance.room.Send(MESSAGE.InstantiatedEquip);
    }

    public EquipItem(equipItem : EquipList) {
        const bone = this.GetItemBone(equipItem);

        const s : number = 10;
        const index = +equipItem % s;
        const data = new RoomData();
        data.Add("bone", +bone);
        data.Add("itemIndex", index);

        MultiplayManager.instance.room.Send(MESSAGE.EquipItem, data.GetObject());
    }

    public UnequipItem(equipItem : EquipList) {
        const bone = this.GetItemBone(equipItem);

        const data = new RoomData();
        data.Add("bone", +bone);

        MultiplayManager.instance.room.Send(MESSAGE.UnequipItem, data.GetObject());
    }

    private OnEquipItem(sessionId : string, bone : HumanBodyBones, itemIndex : number) {
        const items = this.GetBoneItemList(bone);
        const player = ZepetoPlayers.instance.GetPlayer(sessionId);
        if(player) {
            const animator = player.character.ZepetoAnimator;
            const attachBone = animator.GetBoneTransform(bone);
            const itemPrefab = items[itemIndex];

            const item = GameObject.Instantiate<GameObject>(itemPrefab, attachBone);
            switch(bone) {
                case HumanBodyBones.Head:
                    this.equipMap.get(sessionId).Head = item;
                    break;
                case HumanBodyBones.Neck:
                    this.equipMap.get(sessionId).Neck = item;
                    break;
                case HumanBodyBones.RightHand:
                    this.equipMap.get(sessionId).RightHand = item;
                    break;
            }
        }
    }

    private OnUnequipItem(sessionId : string, bone : HumanBodyBones) {
        const equip = this.equipMap.get(sessionId);
        let item : GameObject;
        switch(bone) {
            case HumanBodyBones.Head:
                item = equip.Head;
                equip.Head = null;
                break;
            case HumanBodyBones.Neck:
                item = equip.Neck;
                equip.Neck = null;
                break;
            case HumanBodyBones.RightHand:
                item = equip.RightHand;
                equip.RightHand = null;
                break;
        }

        if(item) {
            GameObject.Destroy(item);
        }
    }

    public VisibleRightHand() {
        const data = new RoomData();
        data.Add("bone", HumanBodyBones.RightHand);
        MultiplayManager.instance.room.Send(MESSAGE.VisibleItem, data.GetObject());
    }

    public InvisibleRightHand() {
        const data = new RoomData();
        data.Add("bone", HumanBodyBones.RightHand);
        MultiplayManager.instance.room.Send(MESSAGE.InvisibleItem, data.GetObject());
    }

    public VisibleHead() {
        const data = new RoomData();
        data.Add("bone", HumanBodyBones.Head);
        MultiplayManager.instance.room.Send(MESSAGE.VisibleItem, data.GetObject());
    }

    public InvisibleHead() {
        const data = new RoomData();
        data.Add("bone", HumanBodyBones.Head);
        MultiplayManager.instance.room.Send(MESSAGE.InvisibleItem, data.GetObject());
    }

    public VisibleNeck() {
        const data = new RoomData();
        data.Add("bone", HumanBodyBones.Neck);
        MultiplayManager.instance.room.Send(MESSAGE.VisibleItem, data.GetObject());
    }

    public InvisibleNeck() {
        const data = new RoomData();
        data.Add("bone", HumanBodyBones.Neck);
        MultiplayManager.instance.room.Send(MESSAGE.InvisibleItem, data.GetObject());
    }

    public VisibleAll() {
        this.VisibleRightHand();
        this.VisibleNeck();
        this.VisibleHead();
    }

    public InvisibleAll() {
        this.InvisibleRightHand();
        this.InvisibleNeck();
        this.InvisibleHead();
    }

    private OnVisible(sessionId : string, bone : HumanBodyBones) {
        const equip = this.equipMap.get(sessionId);
        console.log(equip.RightHand);
        switch(bone) {
            case HumanBodyBones.Head:
                if(equip.Head) equip.Head.SetActive(true);
                break;
            case HumanBodyBones.Neck:
                if(equip.Neck) equip.Neck.SetActive(true);
                break;
            case HumanBodyBones.RightHand:
                if(equip.RightHand) equip.RightHand.SetActive(true);
                break;
        }
    }

    private OnInvisible(sessionId : string, bone : HumanBodyBones) {
        const equip = this.equipMap.get(sessionId);
        switch(bone) {
            case HumanBodyBones.Head:
                if(equip.Head) equip.Head.SetActive(false);
                break;
            case HumanBodyBones.Neck:
                if(equip.Neck) equip.Neck.SetActive(false);
                break;
            case HumanBodyBones.RightHand:
                if(equip.RightHand) equip.RightHand.SetActive(false);
                break;
        }
    }

    private GetItemBone(equipItem : EquipList) {
        switch(equipItem) {
            case EquipList.AnimMike:
            case EquipList.AwardsMike_1:
            case EquipList.AwardsMike_2:
                return HumanBodyBones.RightHand;
            case EquipList.AwardsHead:
                return HumanBodyBones.Head;
            case EquipList.AwardsNeck_1:
            case EquipList.AwardsNeck_2:
                return HumanBodyBones.Neck;
        }
    }

    private GetBoneItemList(bone : HumanBodyBones) : GameObject[]{
        switch(bone) {
            case HumanBodyBones.Head:
                return this.headItems;
            case HumanBodyBones.RightHand:
                return this.rightHandItems;
            case HumanBodyBones.Neck:
                return this.neckItems;
        }
    }
}

interface CurrentEquip {
    Head : GameObject,
    RightHand : GameObject,
    Neck : GameObject,
}
