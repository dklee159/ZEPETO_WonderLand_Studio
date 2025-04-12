import { List$1 } from 'System.Collections.Generic';
import { Vector2, GameObject, LayerMask, PolygonCollider2D, Camera, Vector3, Input, Debug, RectTransform, Mathf } from 'UnityEngine';
import { GraphicRaycaster } from 'UnityEngine.UI';
import { PointerEventData, RaycastResult, EventSystem } from 'UnityEngine.EventSystems';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class RaycastUtilities extends ZepetoScriptBehaviour {

    public static PointerIsOverUI(screenPos : Vector2, obj : GameObject) : boolean {
        const hitObject : GameObject = this.UIRaycast(this.ScreenPosToPointerData(screenPos));
        return hitObject != null && hitObject.layer == LayerMask.NameToLayer("UI") && hitObject.gameObject == obj.gameObject;
    }

    public static GetPointConverToLocal(screenPos : Vector2, obj : GameObject, isSetOffset : boolean = false) : Vector3 {
        const hitObject : GameObject = this.UIRaycast(this.ScreenPosToPointerData(screenPos));

        if (hitObject == obj && hitObject.layer == LayerMask.NameToLayer("UI")) {
            const mousePos = new Vector3(screenPos.x, screenPos.y, 0);
            const local = hitObject.transform.InverseTransformPoint(mousePos);

            if (isSetOffset) {
                local.x += hitObject.GetComponent<RectTransform>().sizeDelta.x * 0.5 + 28;
                local.y += hitObject.GetComponent<RectTransform>().sizeDelta.y * 0.5 + 28;
            }
            return local;
        }
        return null;
    }

    public static PointerIsInVertex(screenPos : Vector2, obj : GameObject) : boolean {
        const hitObject : GameObject = this.UIRaycast(this.ScreenPosToPointerData(screenPos));
        if (hitObject != null && hitObject == obj) {
            const coll = hitObject.GetComponent<PolygonCollider2D>();
    
            if (coll == null) return false;
            
            const worldPoint = Camera.main.ScreenToWorldPoint(new Vector3(screenPos.x, screenPos.y, 1));
            const vec2 : Vector2 = new Vector2(worldPoint.x, worldPoint.y);
            const isHit = coll.OverlapPoint(vec2);
            return hitObject.layer == LayerMask.NameToLayer("UI") && isHit;
        }
        else {
            return false;
        }
    }

    public static UIRaycast(pointerData : PointerEventData) : GameObject {
        let results = new List$1<RaycastResult>();
        EventSystem.current.RaycastAll(pointerData, results);
        return results.Count < 1 ? null : results[0].gameObject;
    }

    private static ScreenPosToPointerData(screenPos : Vector2) : PointerEventData {
        const event = new PointerEventData(EventSystem.current);
        event.position = screenPos;
        return event;
    }

    public static GraphicRay(gr : GraphicRaycaster, pointerData : PointerEventData) {
        let results = new List$1<RaycastResult>();
        gr.Raycast(pointerData, results);
        return results.Count < 1 ? null : results[0].gameObject;
    }
}