import { Collider, Vector3, GameObject, Debug, Time, Rigidbody } from 'UnityEngine'
import { UnityEvent } from 'UnityEngine.Events';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import JetskiManager from './JetskiManager';

export default class Rock extends ZepetoScriptBehaviour {
    /* Properties */
    // private
    private speed : number;
    private dir : Vector3;
    private rb : Rigidbody;
    private jetskiMgr : JetskiManager;

    // public
    public onDestroy : UnityEvent;

    public get Speed() { return this.speed; }
    public set Speed(value : number) { this.speed = value; }
    public get Dir() { return this. dir; }
    public set Dir(value : Vector3) { this.dir = value; }
    
    public StartMove(jetskiMgr : JetskiManager) {
        this.jetskiMgr = jetskiMgr;
        this.StartCoroutine(this.Move());
    }

    public StopMove() {
        this.StopCoroutine(this.Move);
        this.rb.velocity = Vector3.zero;
    }

    private * Move() {
        this.rb = this.GetComponent<Rigidbody>();

        while (!this.gameObject.IsDestroyed) {
            this.rb.velocity = this.Dir * this.Speed * 800 * Time.deltaTime;
            yield null;
        }
    }

    private OnTriggerEnter(coll : Collider) {
        if (coll.CompareTag("Jetski")) {
            this.onDestroy.Invoke();
            this.jetskiMgr.RideStop(false);
        }
        else if (coll.CompareTag("RockDestroyer")) {
            this.onDestroy.Invoke();
        }
    }
}
