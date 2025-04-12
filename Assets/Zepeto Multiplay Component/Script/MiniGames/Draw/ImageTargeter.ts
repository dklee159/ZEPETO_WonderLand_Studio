import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Image, RawImage } from 'UnityEngine.UI';
import { GameObject, Vector2, Input, Debug, LayerMask, PolygonCollider2D, Camera, Vector3 } from 'UnityEngine';
import { PointerEventData, EventSystem, RaycastResult } from 'UnityEngine.EventSystems';
import { List$1 } from 'System.Collections.Generic';
import RaycastUtilities from './RaycastUtilities';

export default class ImageTargeter extends ZepetoScriptBehaviour {
    private targetImgs : List$1<Image> = new List$1<Image>();

    public get TargetImgs() : List$1<Image> { return this.targetImgs; }
    public set TargetImgs(value : List$1<Image>) { this.targetImgs = value; }

    private imgInfos : Map<string, Image> = new Map<string, Image>();

    private targetRawImgs : List$1<RawImage> = new List$1<RawImage>();

    public get TargetRawImgs() : List$1<RawImage> { return this.targetRawImgs; }
    public set TargetRawImgs(value : List$1<RawImage>) { this.targetRawImgs = value; }

    private rawImgInfos : Map<string, RawImage> = new Map<string, RawImage>();


    public IsTargetHit() : boolean {
        const mousePos = new Vector2(Input.mousePosition.x, Input.mousePosition.y);
        let isPointHit : boolean = false;
        for(let i = 0; i < this.TargetImgs.Count; i++) {
            // isPointHit = RaycastUtilities.PointerIsInVertex(mousePos, this.TargetImgs[i].gameObject);
            isPointHit = RaycastUtilities.PointerIsInVertex(mousePos, this.TargetImgs[i].gameObject);
            if (isPointHit) return isPointHit;
        }

        return isPointHit;
    }

    public GetConvertPoint(isSetOffset : boolean = false) {
        const mousePos = new Vector2(Input.mousePosition.x, Input.mousePosition.y);
        let isPointHit : Vector3 = null;
        for(let i = 0; i < this.TargetRawImgs.Count; i++) {
            // isPointHit = RaycastUtilities.PointerIsInVertex(mousePos, this.TargetImgs[i].gameObject);
            isPointHit = RaycastUtilities.GetPointConverToLocal(mousePos, this.TargetRawImgs[i].gameObject, isSetOffset);
            if (isPointHit) return isPointHit;
        }
    }

    public GetImageAsPos(pos : Vector2) : GameObject{
        for(let i = 0; i < this.TargetImgs.Count; i++) {
            const isPointHit = RaycastUtilities.PointerIsInVertex(pos, this.TargetImgs[i].gameObject);
            if (isPointHit) return this.TargetImgs[i].gameObject;
        }

        return null;
    }

    public GetImageByName(imgName : string) {
        return this.imgInfos.has(imgName) ? this.imgInfos.get(imgName) : null;
    }

    public GetTargetImageByName(imgName : string) {
        return this.TargetImgs.Contains(this.GetImageByName(imgName)) ? this.GetImageByName(imgName) : null;
    }

    public AddTargetImageByName(imgName : string) {
        if (this.imgInfos.has(imgName))
            this.AddTargetImage(this.imgInfos.get(imgName));
    }

    public RemoveTargetImageByName(imgName : string) {
        if (this.imgInfos.has(imgName))
            this.RemoveTargetImage(this.imgInfos.get(imgName));
    }

    public AddTargetImage(img : Image) {
        this.TargetImgs.Add(img);
        this.imgInfos.set(img.gameObject.name, img);
    }

    public RemoveTargetImage(img : Image) {
        if (this.TargetImgs.Contains(img)) {
            this.TargetImgs.Remove(img);
            this.imgInfos.delete(img.gameObject.name);
        }
    }

    public AddTargetRawImage(img : RawImage) {
        this.TargetRawImgs.Add(img);
        this.rawImgInfos.set(img.gameObject.name, img);
    }
}

// class RaycastUtilities {
//     public static PointerIsOverUI(screenPos : Vector2, obj : GameObject) : boolean {
//         const hitObject : GameObject = this.UIRaycast(this.ScreenPosToPointerData(screenPos));
//         return hitObject != null && hitObject.layer == LayerMask.NameToLayer("UI") && hitObject.gameObject == obj.gameObject;
//     }

//     public static PointerIsInVertex(screenPos : Vector2, obj : GameObject) : boolean {
//         const hitObject : GameObject = this.UIRaycast(this.ScreenPosToPointerData(screenPos));
//         if (hitObject != null && hitObject == obj) {
//             const coll = hitObject.GetComponent<PolygonCollider2D>();
            
//             const mousePos = Input.mousePosition;
//             mousePos.z = -Camera.main.transform.position.z;
//             const currentPosition : Vector3 = Camera.main.ScreenToWorldPoint(mousePos);
//             const Vector2Pos = new Vector2(currentPosition.x / 0.1, currentPosition.y / 0.1 - 9);
            
//             const isHit = coll.OverlapPoint(Vector2Pos);
//             // Debug.Log(`${isHit}, ${Vector2Pos.x}, ${Vector2Pos.y}`);
//             return hitObject.layer == LayerMask.NameToLayer("UI") && isHit;
//         }
//         else {
//             return false;
//         }
//     }

//     public static UIRaycast(pointerData : PointerEventData) : GameObject {
//         let results = new List$1<RaycastResult>();
//         EventSystem.current.RaycastAll(pointerData, results);
//         return results.Count < 1 ? null : results[0].gameObject;
//     }

//     private static ScreenPosToPointerData(screenPos : Vector2) : PointerEventData {
//         const event = new PointerEventData(EventSystem.current);
//         event.position = screenPos;
//         return event;
//     }
// }