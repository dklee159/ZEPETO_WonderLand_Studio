import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {GameObject, Object, Quaternion, Transform, Vector3, Vector2, WaitForSeconds, WaitUntil, Resources} from 'UnityEngine';
import {ZepetoWorldMultiplay} from "ZEPETO.World";
import {Room, RoomData} from "ZEPETO.Multiplay";
import TransformSyncHelper, { UpdateOwner } from '../Transform/TransformSyncHelper';
import DOTWeenSyncHelper from '../DOTween/DOTWeenSyncHelper';
import AnimatorSyncHelper from '../Transform/AnimatorSyncHelper';
import GameManager from '../../Script/GameManager';
import ZepetoPlayersManager from '../Player/ZepetoPlayersManager';
import { MESSAGE } from '../../Script/TypeManager';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import ChairController from '../../Script/Controllers/ChairController';
import { UnityEvent } from 'UnityEngine.Events';

export default class MultiplayManager extends ZepetoScriptBehaviour {
    public multiplay: ZepetoWorldMultiplay;
    public room: Room;

    @Header("Server connection status (View Only)")
    @SerializeField() private _pingCheckCount:number = 0;
    @SerializeField() private _latency:number = 0;
    @SerializeField() private _diffServerTime:number = 0;
    
    @Header("Disconnect Zone")
    @SerializeField() private disconnectZone : Transform;

    private _masterSessionId:string;
    private _tfHelpers: TransformSyncHelper[] = [];
    private _dtHelpers: DOTWeenSyncHelper[] = [];
    private _animHelper: AnimatorSyncHelper[] = [];
    public onRoomAdded : UnityEvent;

    private readonly pingInterval:number = 1;
    
    get pingCheckCount(){ return this._pingCheckCount; }
    get latency(){ return this._latency; }
    get Room() { return this.room; }
    /* Singleton */
    private static m_instance: MultiplayManager = null;
    public static get instance(): MultiplayManager {
        if (this.m_instance === null) {
            this.m_instance = GameObject.FindObjectOfType<MultiplayManager>();
            if (this.m_instance === null) {
                this.m_instance = new GameObject(MultiplayManager.name).AddComponent<MultiplayManager>();
            }
        }
        return this.m_instance;
    }
    
    private Awake() {
        if (MultiplayManager.m_instance !== null && MultiplayManager.m_instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            MultiplayManager.m_instance = this;
            // GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    private Start() {
        if(!this.multiplay)
            this.multiplay = this.GetComponent<ZepetoWorldMultiplay>();
        if(!this.multiplay) console.warn("Add ZepetoWorldMultiplay First");
        this.multiplay.RoomJoined += (room: Room) => {
            this.room = room;
            this.StartCoroutine(this.SendPing());
            this.CheckMaster();
            this.GetInstantiate();
            
            this.room.AddMessageHandler(MESSAGE.FoodEquipp, (message : any) => {
                const sessionId = message.OwnerSessionId;
                const foodName = message.FoodType;
                switch(message.FoodType) {
                    default:
                        GameManager.instance.EquippFood(sessionId, foodName);
                        break;
                } 
            });

            this.room.AddMessageHandler(MESSAGE.FoodUnequipp, (message : any) => {
                const sessionId = message.OwnerSessionId;
                GameManager.instance.UnequippFood(sessionId);
            });

            this.room.AddMessageHandler(MESSAGE.Busking, (message : any) => {
                const point = message.Point
                const isStart = message.IsStart;

                GameManager.instance.BuskingIsStart(point, isStart);
            });

            this.room.AddMessageHandler(MESSAGE.BuskingHeart, (message : any) => {
                const num = message.Point;

                GameManager.instance.BuskingAddHeart(num);
            });

            this.room.AddMessageHandler(MESSAGE.PlayerSync, (message : any) => {
                const sessionId = message.SessionId;
                const isOn = message.IsOn;
                
                if (sessionId != this.room.SessionId) {
                    const character = ZepetoPlayers.instance.GetPlayer(sessionId).character;
                    
                    if (!isOn) character.transform.Translate(this.disconnectZone.position);

                    // if (!isOn) character.Teleport(this.disconnectZone.position + new Vector3(0, 5, 0), this.disconnectZone.rotation);

                    character.GetComponent<TransformSyncHelper>().SyncPosition = isOn;
                    character.GetComponent<TransformSyncHelper>().SyncRotation = isOn;
                    character.GetComponent<TransformSyncHelper>().SyncScale = isOn;
                }
            });
        }
        this._dtHelpers = Object.FindObjectsOfType<DOTWeenSyncHelper>();
        this._animHelper = Object.FindObjectsOfType<AnimatorSyncHelper>();
    }

    /**Util**/
    private CheckMaster(){
        this.StartCoroutine(this.WaitPingCheck());

        this.room.AddMessageHandler(MESSAGE.MasterResponse, (masterSessionId :string) => {
            this._masterSessionId = masterSessionId;
            this._tfHelpers = Object.FindObjectsOfType<TransformSyncHelper>();
            this._tfHelpers.forEach((tf)=>{
                if(tf.UpdateOwnerType == UpdateOwner.Master){
                    tf.ChangeOwner(this._masterSessionId);
                }
            });
            this._dtHelpers.forEach((dt)=>{
                dt.ChangeOwner(this._masterSessionId);
            });
            this._animHelper.forEach((anim)=>{
                anim.ChangeOwner(this._masterSessionId);
            });
        });
    }

    // This function is used to instantiate a new object in the game. It sends a message to the server requesting the creation of the object, 
    // and waits for the server to respond with the necessary information to create it.
    private GetInstantiate(){
        this.room.Send(MESSAGE.RequestInstantiateCache);
        this.room.AddMessageHandler(MESSAGE.Instantiate, (message:InstantiateObj) => {
            const prefabObj = Resources.Load(message.prefabName) as GameObject;
            if(null === prefabObj){
                console.warn(`${message.prefabName} is null, Add Prefab in the Resources folder.`);
                return;
            }
            const spawnPosition = message.spawnPosition ? new Vector3(message.spawnPosition.x, message.spawnPosition.y, message.spawnPosition.z) : prefabObj.transform.position;
            const spawnRotation= message.spawnRotation ? new Quaternion(message.spawnRotation.x, message.spawnRotation.y, message.spawnRotation.z, message.spawnRotation.w) : prefabObj.transform.rotation

            const newObj:GameObject = Object.Instantiate(prefabObj, spawnPosition, spawnRotation) as GameObject;
            
            // If the object has a TransformSyncHelper script attached to it, it sets the script's ID and owner information. 
            // If the object does not have a TransformSyncHelper script, a warning is logged to the console.
            const tf = newObj?.GetComponent<TransformSyncHelper>();
            if(null === tf) { //Creates an none-sync object.
                console.warn(`${tf.name} does not have a TransformSyncHelper script.`);
                return;
            }

            tf.Id = message.Id;
            if(tf.UpdateOwnerType === UpdateOwner.Master) {
                tf.ChangeOwner(this._masterSessionId);
            }
            else if(message.ownerSessionId){
                tf.ChangeOwner(message.ownerSessionId);
            }
        });
    }

    /** Destroy synchronization objects */
    public Destroy(DestroyObject: GameObject){
        const tf = DestroyObject.GetComponent<TransformSyncHelper>();
        const objId = tf?.Id;
        if(null === objId) {
            console.warn("Only objects that contain TransformSyncHelper scripts can be deleted.");
            return;
        }
        this.SendStatus(objId,GameObjectStatus.Destroyed);
        Object.Destroy(DestroyObject);
    }

    /** /Asset/Resources/ Add the prefabs to create in the path. Add TransformSyncHelper.ts to the prefab to synchronize objects as well as creation.
     @param prefabName The name or path of the prefab on the resource folder ( ex) Monsters/zombie)
     @param ownerSessionId Inject owner into objects whose transform sync type is Undefine
     */
    public Instantiate(prefabName: string, ownerSessionId? : string, spawnPosition?: Vector3, spawnRotation?: Quaternion){
        const newObjId = MultiplayManager.instance.GetServerTime().toString();

        const data = new RoomData();
        data.Add("Id", newObjId);
        data.Add("prefabName", prefabName);
        data.Add("ownerSessionId", ownerSessionId);
        if(undefined != spawnPosition) {
            const position = new RoomData();
            position.Add("x",spawnPosition.x);
            position.Add("y",spawnPosition.y);
            position.Add("z",spawnPosition.z);
            data.Add("spawnPosition", position.GetObject());
        }

        if(undefined != spawnRotation) {
            const rotation = new RoomData();
            rotation.Add("x",spawnRotation.x);
            rotation.Add("y",spawnRotation.y);
            rotation.Add("z",spawnRotation.z);
            rotation.Add("w",spawnRotation.w);
            data.Add("spawnRotation", rotation.GetObject());
        }

        this.room.Send(MESSAGE.Instantiate, data.GetObject());
    }
    
    // When the application is paused (e.g. when the screen is closed or the home screen is opened)
    private bPaused: boolean = false;
    private OnApplicationPause(pause: boolean) {
        if (pause && !this.bPaused) {
            this.PauseUser();
        }
        else if (!pause && this.bPaused) {
            this.UnPauseUser();
        }
    }

    private PauseUser(){
        this.room?.Send(MESSAGE.PauseUser);

        this.bPaused = true;
        this._pingCheckCount = 0;
        this._tfHelpers = Object.FindObjectsOfType<TransformSyncHelper>();
        // While paused, no information is received.
        this._tfHelpers?.forEach((tf)=> {
            if(tf.UpdateOwnerType === UpdateOwner.Master) {
                tf.ChangeOwner(null);
            }
            else if(tf.isOwner){
                this.SendStatus(tf.Id,GameObjectStatus.Pause);
            }
        });
        this._dtHelpers?.forEach((dt)=> {
            dt.ChangeOwner(null);
        });
    }

    private UnPauseUser(){
        this.room?.Send(MESSAGE.UnPauseUser);

        this.bPaused = false;
        this._tfHelpers = Object.FindObjectsOfType<TransformSyncHelper>();
        this._tfHelpers?.forEach((tf)=>{
            if(tf.isOwner){
                this.SendStatus(tf.Id,GameObjectStatus.Enable);
            }
            else{
                tf.ForceTarget();
            }
        });
    }

    // Ping every 1 second to check latency with the server *
    private *SendPing(){
        let RequestTime = Number(+new Date());
        let ResponseTime = Number(+new Date());
        let isResponseDone = false;

        this.room.AddMessageHandler(MESSAGE.CheckServerTimeResponse, (serverTime: number) => {
            ResponseTime = Number(+new Date());
            this._latency = (ResponseTime - RequestTime) / 2
            this._diffServerTime = Number(serverTime) - ResponseTime - this.latency;
            this._pingCheckCount++;
            isResponseDone = true;
        });

        while(true) {
            if(!this.bPaused) {
                this.room.Send(MESSAGE.CheckServerTimeRequest);
                RequestTime = Number(+new Date());
                yield new WaitUntil(() => isResponseDone == true);
            }
            isResponseDone = false;
            yield new WaitForSeconds(this.pingInterval);
        }
    }

    // After checking the connection with the server once, request the master information.
    private * WaitPingCheck(){
        if(this.pingCheckCount == 0)
            yield new WaitUntil(()=> this.pingCheckCount > 0)
        this.room.Send(MESSAGE.CheckMaster);
    }

    //Returns the current server time.
    public GetServerTime(){
        return this._diffServerTime + Number(+new Date());
    }

    private SendStatus(id:string, status:GameObjectStatus){
        const data = new RoomData();
        data.Add("Id", id);
        data.Add("Status", status);
        this.room.Send(MESSAGE.SyncTransformStatus, data.GetObject());
    }
}

interface InstantiateObj{
    Id:string;
    prefabName:string;
    ownerSessionId?:string;
    spawnPosition?:Vector3;
    spawnRotation?:Quaternion;
}

export enum GameObjectStatus{
    Destroyed = -1,
    Disable, //does not yet supported
    Enable,
    Pause,
}
