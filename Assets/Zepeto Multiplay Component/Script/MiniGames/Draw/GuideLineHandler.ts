import { Image } from 'UnityEngine.UI';
import { Vector2, Sprite, Vector3 } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class GuideLineHandler extends ZepetoScriptBehaviour {
    private startRange : number = 0.02;
    private detectRange : number = 0.035;
    @SerializeField() private guideSprite : Sprite;
    @SerializeField() private drawnSprite : Sprite;

    private guideImage : Image;
    private guideLines : GuideLine[] = new Array<GuideLine>();
    private lineIndex : number = 0;
    private lineNum : number = 0;
    private isSuccess : boolean = false;
    private successDrawNums : number[] = [];

    public get IsSuccess() { return this.isSuccess; } 
    public set IsSuccess(value : boolean) {
        this.isSuccess = value;
        if (value) {
            this.guideImage.sprite = this.drawnSprite;
        }
        else {
            this.guideImage.sprite = this.guideSprite;
        }
    }
    
    OnEnable(){
        if(this.guideImage == null) this.guideImage = this.GetComponent<Image>();
        this.SetGuideLine(this.guideImage);
        this.IsSuccess = false;
    }

    private SetGuideLine(img : Image) {
        this.lineNum = img.transform.childCount;
        this.lineIndex = 0;

        // clear guide lines;
        while (this.guideLines.length > 0)
            this.guideLines.pop();

        // set guide lines;
        for(let i = 0; i < this.lineNum; i++) {
            const line = img.transform.GetChild(i);
            const pointNum = line.transform.childCount;
            const pointArr = new Array<Vector3>(pointNum);

            for(let j = 0; j < pointNum; j++) {
                const point = line.GetChild(j);
                // const pointToVec2 = new Vector2(point.position.x, point.position.y);
                pointArr[j] = point.position;
            }

            this.guideLines[i] = new GuideLine(pointArr, pointNum);
        }
    }

    private GetCurrentLine() : GuideLine {
        if (this.guideLines[this.lineIndex] != null)
            return this.guideLines[this.lineIndex];
    }

    private GetStartPoint() : Vector3 {
        const line : GuideLine = this.GetCurrentLine();
        return line.GetPoint(0);
    }

    private InitLinePoints() {
        const line : GuideLine = this.GetCurrentLine();
        line.InitPoint();
    }

    public CanDrawLineStart(pos : Vector3) : boolean {
        if (this.IsSuccess) return false;
        const distance = Vector3.Distance(pos, this.GetStartPoint());
        const canDraw = distance < this.startRange;

        if (canDraw) this.InitLinePoints();
        return canDraw;
    }

    public DrawingLine(pos : Vector3) : boolean {
        const line = this.GetCurrentLine();
        const distToNext = Vector3.Distance(pos, line.GetCurrentPoint());
        
        if (distToNext <= this.detectRange){
            const hasNextPoint : boolean = line.SetNextPoint();
            if (!hasNextPoint) return true;
        }
        
        return false;
    }

    public GetCurrentLineStartPoint() {
        const line = this.GetCurrentLine();
        return line.startPoint;
    }

    public GetCurrentLineEndPoint() {
        const line = this.GetCurrentLine();
        return line.endPoint;
    }

    public SetNextGuideLine(drawNum : number) : boolean {
        this.lineIndex++;
        if (this.lineIndex >= this.lineNum) {
            this.IsSuccess = true;
        }

        this.successDrawNums[this.successDrawNums.length] = drawNum;
        return this.lineIndex < this.lineNum;
    }

    public GetSuccessDrawNums() : number[] {
        return this.successDrawNums;
    }
}

class GuideLine {
    private points : Vector3[] = [];
    private pointIndex : number = 0;
    public startPoint : Vector3;
    public endPoint : Vector3;
    public pointNum : number;

    constructor(points : Vector3[], pointNum : number) {
        this.points = points;
        this.pointNum = pointNum;
        this.startPoint = points[0];
        this.endPoint = points[points.length - 1];
    }

    public InitPoint() {
        this.pointIndex = 0;
    }

    public GetPoint(index : number) : Vector3 {
        return this.points[index]
    }

    public GetCurrentPoint() : Vector3 {
        return this.GetPoint(this.pointIndex);
    }

    public GetNextPoint() : Vector3 {
        return this.GetPoint(this.pointIndex + 1);
    }

    public SetNextPoint() : boolean{ 
        this.pointIndex++;
        return this.pointIndex < this.pointNum;
    }

    public isSuccess() : boolean {
        return this.pointIndex >= this.pointNum - 1;
    }
}