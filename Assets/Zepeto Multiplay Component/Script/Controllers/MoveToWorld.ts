import { Collider } from "UnityEngine";
import {
    UIZepetoPlayerControl,
    ZepetoPlayers,
} from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import { ZepetoWorldContent } from "ZEPETO.World";

export default class MoveToWorld extends ZepetoScriptBehaviour {
    @SerializeField() private teleportType: TeleportType;
    @SerializeField() private worldId: string;
    private dd: string;
    private OnTriggerEnter(coll: Collider) {
        if (
            coll.gameObject ==
            ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.gameObject
        ) {
            ZepetoWorldContent.MoveToWorld(this.worldId, (errCode, errMsg) => {
                // Example of error callback processing
                // (When implementing,try to implement it in various ways, such as pop-up windows)
                console.log(`${errCode} - ${errMsg}`);
            });
        }
    }
}

enum WorldId {
    Wonder = "com.kofice.kwonderland",
    Studio = "com.kofice.kwonderdrama",
    Stage = "com.kofice.kwonderlandpop",
    Awards = "com.kofice.kwonderawards",
}

export enum TeleportType {
    Wonder = "Wonder",
    Studio = "Studio",
    Stage = "Stage",
    Awards = "Awards",
}
