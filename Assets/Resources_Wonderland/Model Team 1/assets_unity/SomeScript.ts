import { Material, Renderer, Time, Vector2 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class SomeScript extends ZepetoScriptBehaviour {

    /* Properties */
    public speedX:number = 0.1;
    public speedY:number = 0.1;
    public curX:number = 0.1;
    public curY:number = 0.1;

    private mat:Material;

    Start() {
        this.curX = this.GetComponent<Renderer>().material.mainTextureOffset.x;
        this.curY = this.GetComponent<Renderer>().material.mainTextureOffset.y;

        this.mat = this.GetComponent<Renderer>().material;
    }
    
    FixedUpdate() {
        this.curX += Time.deltaTime * this.speedX;
        this.curY += Time.deltaTime * this.speedY;
        this.mat.SetTextureOffset("_MainTex", new Vector2(this.curX, this.curX));
    }

}