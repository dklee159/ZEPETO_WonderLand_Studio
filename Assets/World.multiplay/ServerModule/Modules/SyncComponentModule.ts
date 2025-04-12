import { SandboxPlayer } from "ZEPETO.Multiplay";
import { IModule } from "../IModule";
import { sVector3, sQuaternion, SyncTransform, PlayerAdditionalValue, ZepetoAnimationParam, Player} from "ZEPETO.Multiplay.Schema";
import { DataStorage } from "ZEPETO.Multiplay.DataStorage";
import { HttpService } from "ZEPETO.Multiplay.HttpService";
// import { Bool } from "types/HelperTypes";
import { HttpData, MESSAGE, WorldData, PlayerEquip } from "../IModule";

export default class SyncComponentModule extends IModule {
    private sessionIdQueue: string[] = [];
    private instantiateObjCaches : InstantiateObj[] = [];
    private masterClient: Function = (): SandboxPlayer | undefined => this.server.loadPlayer(this.sessionIdQueue[0]);
    private equipMap : Map<string, PlayerEquip> = new Map<string, PlayerEquip>();

    async OnCreate() {
        /**Zepeto Player Sync**/
        this.server.onMessage(MESSAGE.SyncPlayer, (client, message) => {
            const player = this.server.state.players.get(client.sessionId);
            if (player) {
                const animationParam = new ZepetoAnimationParam();
                player.animationParam = Object.assign(animationParam, message.animationParam);
                player.gestureName = message.gestureName ?? null;

                if (message.playerAdditionalValue) {
                    const pAdditionalValue = new PlayerAdditionalValue();
                    player.playerAdditionalValue = Object.assign(pAdditionalValue, message.playerAdditionalValue);
                }
            }
        });

        /**Transform Sync**/
        this.server.onMessage(MESSAGE.SyncTransform, (client, message) => {
            const { Id, position, localPosition, rotation, scale, sendTime } = message;
            let syncTransform = this.server.state.SyncTransforms.get(Id.toString());

            if (!syncTransform) {
                syncTransform = new SyncTransform();
                this.server.state.SyncTransforms.set(Id.toString(), syncTransform);
            }

            Object.assign(syncTransform.position, position);
            Object.assign(syncTransform.localPosition, localPosition);
            Object.assign(syncTransform.rotation, rotation);
            Object.assign(syncTransform.scale, scale);
            syncTransform.sendTime = sendTime;
        });

        this.server.onMessage(MESSAGE.SyncTransformStatus, (client, message) => {
            const syncTransform = this.server.state.SyncTransforms.get(message.Id);
            if(syncTransform !== undefined) {
                syncTransform.status = message.Status;
            }
        });

        /** Sync Animaotr **/
        this.server.onMessage(MESSAGE.SyncAnimator, (client, message) => {
            const animator: SyncAnimator = {
                Id: message.Id,
                clipNameHash: message.clipNameHash,
                clipNormalizedTime: message.clipNormalizedTime,
            };
            const masterClient = this.masterClient();
            if (masterClient !== null && masterClient !== undefined) {
                console.log(`sync anim : ${message.Id}, ${message.clipNameHash}`);
                this.server.broadcast(MESSAGE.ResponseAnimator + message.Id, animator, {except: masterClient});
            }
        });

        /** SyncTransform Util **/
        this.server.onMessage(MESSAGE.ChangeOwner, (client,message:string) => {
            this.server.broadcast(MESSAGE.ChangeOwner+message, client.sessionId);
        });
        this.server.onMessage(MESSAGE.Instantiate, (client,message:InstantiateObj) => {
            const InstantiateObj: InstantiateObj = {
                Id: message.Id,
                prefabName: message.prefabName,
                ownerSessionId: message.ownerSessionId,
                spawnPosition: message.spawnPosition,
                spawnRotation: message.spawnRotation,
            };
            this.instantiateObjCaches.push(InstantiateObj);
            this.server.broadcast(MESSAGE.Instantiate, InstantiateObj);
        });

        this.server.onMessage(MESSAGE.RequestInstantiateCache, (client) => {
            for (const obj of this.instantiateObjCaches) {
                client.send(MESSAGE.Instantiate, obj);
            }
        });

        /**SyncDOTween**/
        this.server.onMessage(MESSAGE.SyncDOTween, (client, message: syncTween) => {
            const tween: syncTween = {
                Id: message.Id,
                position: message.position,
                nextIndex: message.nextIndex,
                loopCount: message.loopCount,
                sendTime: message.sendTime,
            };
            const masterClient = this.masterClient();
            if (masterClient !== null && masterClient !== undefined) {
                this.server.broadcast(MESSAGE.ResponsePosition + message.Id, tween, {except: masterClient});
            }
        });

        /**Common**/
        this.server.onMessage(MESSAGE.CheckServerTimeRequest, (client, message) => {
            let Timestamp = +new Date();
            client.send(MESSAGE.CheckServerTimeResponse, Timestamp);
        });
        this.server.onMessage(MESSAGE.CheckMaster, (client, message) => {
            console.log(`master->, ${this.sessionIdQueue[0]}`);
            this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
        });
        this.server.onMessage(MESSAGE.PauseUser, (client) => {
            if(this.sessionIdQueue.includes(client.sessionId)) {
                const pausePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
                this.sessionIdQueue.splice(pausePlayerIndex, 1);

                if (pausePlayerIndex == 0) {
                    console.log(`master->, ${this.sessionIdQueue[0]}`);
                    this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
                }
            }
        });

        this.server.onMessage(MESSAGE.UnPauseUser, (client) => {
            if(!this.sessionIdQueue.includes(client.sessionId)) {
                this.sessionIdQueue.push(client.sessionId);
                this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        });
        
        this.server.onMessage(MESSAGE.HTTP, (client, message) => {
            console.log(`[MainServer:testRequest] Sending Test ${message.method} Request to ${message.url} Via HTTPService`);
            if (message.METHOD == HttpData.GET) {
              this.SendRequest_GET(client, message.URL);
            } else if (message.METHOD == HttpData.POST) {
              this.SendRequest_POST(client, message.URL, message.DATA);
            }
        });

        this.server.onMessage(MESSAGE.PlayerDB, (client, message) => {
            const player = this.server.state.players.get(client.sessionId);
            if (!player) return;
            player.playerDB = message;
        });
      

        /* STUDIO Receiver */
        this.server.onMessage(MESSAGE.FoodEquipp, (client, message : any) => {
            const data = {
                OwnerSessionId : client.sessionId,
                FoodType : message.FoodType,
            }
            this.server.broadcast(MESSAGE.FoodEquipp, data);
        });
        
        this.server.onMessage(MESSAGE.FoodUnequipp, (client, message : any) => {
            const data = {
                OwnerSessionId : message.SessionId,
            }
            this.server.broadcast(MESSAGE.FoodUnequipp, data);
        })

        this.server.onMessage(MESSAGE.Busking, (client, message : any) => {
            const data = {
                Point : message.Point,
                IsStart : message.IsStart
            }
            this.server.broadcast(MESSAGE.Busking, data);
        });

        this.server.onMessage(MESSAGE.BuskingHeart, (client, message : any) => {
            const data = {
                Point : message.Point
            }
            this.server.broadcast(MESSAGE.Busking, data);
        });

        this.server.onMessage(MESSAGE.PlayerSync, (client, message : any) => {
            const data = {
                SessionId : client.sessionId,
                IsOn : message.isOn,
            }

            this.server.broadcast(MESSAGE.PlayerSync, data);
        });

        this.server.onMessage(MESSAGE.ChairSit, (client, message : any) => {
            const data = {
                SessionId : client.sessionId,
                IsSit : message.isSit
            }

            this.server.broadcast(message.chairId, data);
        });

        this.server.onMessage(MESSAGE.AddBadge, (client, message: any) => {
            const player = this.server.state.players.get(client.sessionId);
            if (!player) return;
            player.wonderWorldData.MissionClear_Badge = true;
        });

        this.server.onMessage(MESSAGE.InstantiatedEquip, (client, message) => {
            this.equipMap.forEach((equipData : PlayerEquip, sessionId : string) => {
                if(equipData.Head.IsEquip) client.send(MESSAGE.EquipItem, {
                    SessionId : sessionId,
                    Bone : 10,
                    ItemIndex : equipData.Head.Index
                });
                if(equipData.Neck.IsEquip) client.send(MESSAGE.EquipItem, {
                    SessionId : sessionId,
                    Bone : 9,
                    ItemIndex : equipData.Neck.Index
                });
                if(equipData.RightHand.IsEquip) client.send(MESSAGE.EquipItem, {
                    SessionId : sessionId,
                    Bone : 18,
                    ItemIndex : equipData.RightHand.Index
                });
            });
        });

        this.server.onMessage(MESSAGE.EquipItem, (client, message) => {
            const bone = message.bone;
            const itemIndex = message.itemIndex;

            const data = {
                SessionId : client.sessionId,
                Bone : bone,
                ItemIndex : itemIndex,
            }

            const equip = this.equipMap.get(client.sessionId);
            if(equip) {
                switch(bone) {
                    case 10:    // head
                        if(equip.Head.IsEquip) this.server.broadcast(MESSAGE.UnequipItem, { SessionId : client.sessionId, Bone : bone });
                        equip.Head.Index = itemIndex;
                        equip.Head.IsEquip = true;
                        break;
                    case 9:     // neck
                        if(equip.Neck.IsEquip) this.server.broadcast(MESSAGE.UnequipItem, { SessionId : client.sessionId, Bone : bone });
                        equip.Neck.Index = itemIndex;
                        equip.Neck.IsEquip = true;
                        break;
                    case 18:    // right hand
                        if(equip.RightHand.IsEquip) this.server.broadcast(MESSAGE.UnequipItem, { SessionId : client.sessionId, Bone : bone });
                        equip.RightHand.Index = itemIndex;
                        equip.RightHand.IsEquip = true;
                        break;
                }
                this.server.broadcast(MESSAGE.EquipItem, data);
            }
        });

        this.server.onMessage(MESSAGE.UnequipItem, (client, message) => {
            const equip = this.equipMap.get(client.sessionId);
            const bone = message.bone;

            if(equip) {
                switch(bone) {
                    case 10:    // head
                        equip.Head.Index = -1;
                        equip.Head.IsEquip = false;
                        break;
                    case 9:     // neck
                        equip.Neck.Index = -1;
                        equip.Neck.IsEquip = false;
                        break;
                    case 18:    // right hand
                        equip.RightHand.Index = -1;
                        equip.RightHand.IsEquip = false;
                        break;
                }
            }

            this.server.broadcast(MESSAGE.UnequipItem, { SessionId : client.sessionId, Bone : bone });
        });

        this.server.onMessage(MESSAGE.VisibleItem, (client, message) => {
            const equip = this.equipMap.get(client.sessionId);
            const bone = message.bone;
            let isEquip : boolean = false;

            if(equip) {
                switch(bone) {
                    case 10:
                        isEquip = equip.Head.IsEquip;
                        break;
                    case 9:
                        isEquip = equip.Neck.IsEquip;
                        break;
                    case 18:
                        isEquip = equip.RightHand.IsEquip;
                        break;
                }
            }

            if(isEquip) this.server.broadcast(MESSAGE.VisibleItem, { SessionId : client.sessionId, Bone :  bone});
        });

        this.server.onMessage(MESSAGE.InvisibleItem, (client, message) => {
            const equip = this.equipMap.get(client.sessionId);
            const bone = message.bone;
            let isEquip : boolean = false;

            if(equip) {
                switch(bone) {
                    case 10:
                        isEquip = equip.Head.IsEquip;
                        break;
                    case 9:
                        isEquip = equip.Neck.IsEquip;
                        break;
                    case 18:
                        isEquip = equip.RightHand.IsEquip;
                        break;
                }
            }

            if(isEquip) this.server.broadcast(MESSAGE.InvisibleItem, { SessionId : client.sessionId, Bone :  bone});
        });
    }

    async OnJoin(client: SandboxPlayer) {
        if(!this.sessionIdQueue.includes(client.sessionId)) {
            this.sessionIdQueue.push(client.sessionId.toString());
        }
        this.equipMap.set(client.sessionId, {
            Head : { Index : -1, IsEquip : false },
            RightHand : { Index : -1, IsEquip : false },
            Neck : { Index : -1, IsEquip : false }
        });

        const storage: DataStorage = client.loadDataStorage();

        let worldVisitCount = await storage.get("visit") as string;

        if(!worldVisitCount) {
            worldVisitCount = JSON.stringify({count: 0});
        }

        const visit = JSON.parse(worldVisitCount);
        visit.count += 1;
        console.log(`count: :::::::${JSON.stringify(visit)}`);


        await storage.set("visit", JSON.stringify(visit));
    }

    async OnJoined(client: SandboxPlayer) {
        const players = this.server.state.players;
        const player = players.get(client.sessionId);

        /* load storage */
        const storage: DataStorage = client.loadDataStorage();

        /* World Data */
        // Find Data
        let JSON_data = await storage.get(StorageName.WorldData) as string;
        console.log(`[Storage] ${StorageName.WorldData} loaded... ${JSON_data}`);
        const isNotFound = JSON_data == null || JSON_data == undefined;

        // Processing Data
        if (isNotFound) JSON_data = this.CompressWorldData(client.sessionId, true);
        else this.ParseWorldData(client.sessionId, JSON_data);

        // Save Data
        console.log(`[OnJoin] ${client.sessionId}'s Wonder World Data : ${JSON_data}`);
        await storage.set(StorageName.WorldData, JSON_data);

        /* onJoined End */
        this.server.state.players.set(client.sessionId, player);
    }

    async OnLeave(client: SandboxPlayer) {
        if(this.equipMap.has(client.sessionId)) this.equipMap.delete(client.sessionId);
        console.log(`[OnLeave] Data Post Start`);
        const player = this.server.state.players.get(client.sessionId);
        
        this.SendRequest_POST(client, HttpData.POST_URL, player.playerDB as string);
        
        const JSON_data = this.CompressWorldData(client.sessionId);
        /* Wonder World Data */
        console.log(`[OnLeave] ${StorageName.WorldData} saved... ${JSON_data}`);
        console.log(`[onLeave] ${client.sessionId}'s Player World Data : ${JSON_data}`)
        await client.loadDataStorage().set(StorageName.WorldData, JSON_data);
        
        if(this.sessionIdQueue.includes(client.sessionId)) {
            const leavePlayerIndex = this.sessionIdQueue.indexOf(client.sessionId);
            this.sessionIdQueue.splice(leavePlayerIndex, 1);
            if (leavePlayerIndex == 0) {
                console.log(`master->, ${this.sessionIdQueue[0]}`);
                this.server.broadcast(MESSAGE.MasterResponse, this.sessionIdQueue[0]);
            }
        }
    }


    private SendRequest_GET(client: SandboxPlayer, url: string) {
        const response = HttpService.getAsync(url);
        response.then((httpResponse) => {
            const jsonData = JSON.parse(httpResponse.response);
            console.log(`[HttpService] GET : ${httpResponse.statusCode}: ${httpResponse.statusText} \n\n${httpResponse.response}`);
            const data = {
                type: HttpData.GET,
                hasData: !(Object.keys(jsonData.body).length === 0),
                body: jsonData.body,
            };
            client.send(MESSAGE.HTTP, data);
        });
    }

    private SendRequest_POST(client: SandboxPlayer, url: string, data: string) {
        const response = HttpService.postAsync(url, data);
        console.log(`post data\n${data}`);
        console.log(`server last date : ${JSON.parse(data)["attend"]["lastDate"]}`);
        response.then((httpResponse) => {
            const data = JSON.parse(httpResponse.response);
            // console.log(data);
            console.log(`[HttpService] POST : ${httpResponse.statusCode}: ${httpResponse.statusText} \n\n${data.body}`);
            client.send(HttpData.POST, true);
        });
    }

    private CompressWorldData(sessionId: string, isInit: boolean = true) {
        /* get player */
        const players = this.server.state.players;
        const player = players.get(sessionId) as Player;
    
        /* Set Player Data */
        if (isInit) {
            player.wonderWorldData.MissionClear_Badge = false
        }
    
        const worldData:WorldData = {
            missionClear_Badge: player.wonderWorldData.MissionClear_Badge,
        }

        console.log(worldData);
        console.log('worldData', JSON.stringify(worldData));
        return JSON.stringify(worldData);
    }
    
      /* Parse and Get Data */
    private ParseWorldData(sessionId: string, json_date: string) {
        /* get player */
        const players = this.server.state.players;
        const player = players.get(sessionId);
        const worldData: WorldData = JSON.parse(json_date) as WorldData;
    
        player.wonderWorldData.MissionClear_Badge = worldData.missionClear_Badge as boolean;
    }

    OnTick(deltaTime: number) {
    }

}
interface syncTween {
    Id: string,
    position: sVector3,
    nextIndex: number,
    loopCount: number,
    sendTime: number,
}

interface SyncAnimator {
    Id: string,
    clipNameHash: number,
    clipNormalizedTime: number,
}

interface InstantiateObj{
    Id:string;
    prefabName:string;
    ownerSessionId?:string;
    spawnPosition?:sVector3;
    spawnRotation?:sQuaternion;
}
enum StorageName {
    VisitCount = 'VisitCount',
    WonderCoin = 'WonderCoin',
    PlayerData = 'PlayerData',
    WorldData = 'WonderWorldData_0.8.0',
}
