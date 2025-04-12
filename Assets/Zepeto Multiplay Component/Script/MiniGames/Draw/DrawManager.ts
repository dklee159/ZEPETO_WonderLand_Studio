import { Debug, Input, LineRenderer, Vector3, Camera, GameObject, Sprite, Vector2, Canvas, Color } from 'UnityEngine'
import { UIZepetoPlayerControl, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Button, Image, Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ImageTargeter from './ImageTargeter';
import RaycastUtilities from './RaycastUtilities';
import GuideLineHandler from './GuideLineHandler';
import InteractionBtn from '../../Interaction/InteractionBtn';
import UIManager from '../../Manager/UIManager';

export default class DrawManager extends ZepetoScriptBehaviour {
    [x: string]: any;
    @SerializeField() private drawCanvas : Canvas;
    @SerializeField() private drawPanel : GameObject;
    @SerializeField() private linePrefab : GameObject;
    @SerializeField() private consonantsParent : GameObject;
    @SerializeField() private vowelsParent : GameObject;
    @SerializeField() private _interactionBtn : GameObject;
    
    @Header("Buttons")
    @SerializeField() private closeBtn : Button;
    @SerializeField() private nextBtn : Button;
    @SerializeField() private prevBtn : Button;
    @SerializeField() private consBtn : Button;
    @SerializeField() private vowelBtn : Button;
    
    @Header("Sprites")
    @SerializeField() private selectedImage : Sprite;
    @SerializeField() private unselectedImage : Sprite;
    
    private imageTargeter : ImageTargeter;
    private guideLineHandler : GuideLineHandler;
    private isDrawStart : boolean = false;
    private isDrawing : boolean = false
    private minDistance : number = 0.01;
    private drawNum : number = 0;
    private previousPosition : Vector3 = Vector3.zero;
    private drawPoints : Map<number, GameObject> = new Map<number, GameObject>();
    private currentDrawImages : DrawPreset;
    private consPresets : DrawPreset[] = [];
    private vowelPresets : DrawPreset[] = [];
    private drawMode : DrawMode;
    private drawIndex : number = null;
    private drawIndexMax : number = 0;

    public get DrawIndex() { return this.drawIndex; }
    public set DrawIndex(value : number) {
        if (value <= 0) {
            value = 0;
            this.prevBtn.gameObject.SetActive(false);
            if (!this.nextBtn.gameObject.activeSelf) this.nextBtn.gameObject.SetActive(true);
        }
        else if (value >= this.drawIndexMax) {
            value = this.drawIndexMax;
            this.nextBtn.gameObject.SetActive(false);
            if (!this.prevBtn.gameObject.activeSelf) this.prevBtn.gameObject.SetActive(true);
        }
        else {
            if (!this.prevBtn.gameObject.activeSelf) this.prevBtn.gameObject.SetActive(true);
            if (!this.nextBtn.gameObject.activeSelf) this.nextBtn.gameObject.SetActive(true);
        }
        this.drawIndex = value;

        if (this.drawMode == DrawMode.Consonant) {
            this.SwitchDrawImage(this.consPresets[value]);
        }
        else if (this.drawMode == DrawMode.Vowel) {
            this.SwitchDrawImage(this.vowelPresets[value]);
        }
    }


    private Start() {
        this.imageTargeter = this.transform.GetComponent<ImageTargeter>();
        this.drawCanvas.worldCamera = ZepetoPlayers.instance.ZepetoCamera.camera;
        this.drawCanvas.planeDistance = 1;        
        this.closeBtn.onClick.AddListener(() => {
            this.DrawFinish();
        });

        this.nextBtn.onClick.AddListener(() => {
            this.DrawPanelInit();
            this.DrawIndex++;
        });

        this.prevBtn.onClick.AddListener(() => {
            this.DrawPanelInit();
            this.DrawIndex--;
        });

        this.consBtn.onClick.AddListener(() => {
            this.DrawPanelInit();
            this.SetDrawingMode(DrawMode.Consonant);
        });

        this.vowelBtn.onClick.AddListener(() => {
            this.DrawPanelInit();
            this.SetDrawingMode(DrawMode.Vowel);
        });

        const consChildCnt = this.consonantsParent.transform.childCount;
        const vowelChildCnt = this.vowelsParent.transform.childCount;

        for (let i = 0; i < consChildCnt / 3; i++) {
            const num = i * 3;
            let preset : DrawPreset= {
                firstImage : null,
                secondImage : null,
                thirdImage : null
            };
            for (let j = 0; j < 3; j++) {
                if (num + j >= consChildCnt) break;
                const obj = this.consonantsParent.transform.GetChild(num + j)
                const image = obj.GetComponent<Image>();
                if (j == 0) preset.firstImage = image;
                else if (j == 1) preset.secondImage = image;
                else if (j == 2) preset.thirdImage = image;
                this.imageTargeter.AddTargetImage(image);
            }
            this.consPresets[i] = preset;
        }
        
        for(let i = 0; i < vowelChildCnt / 3; i++) {
            const num = i * 3;
            let preset : DrawPreset = {
                firstImage : null,
                secondImage : null,
                thirdImage : null
            };
            for (let j = 0; j < 3; j++) {
                if (num + j >= vowelChildCnt) break;
                const obj = this.vowelsParent.transform.GetChild(num + j)
                const image = obj.GetComponent<Image>();
                if (j == 0) preset.firstImage = image;
                else if (j == 1) preset.secondImage = image;
                else if (j == 2) preset.thirdImage = image;
                this.imageTargeter.AddTargetImage(image);
            }
            this.vowelPresets[i] = preset;
        }
    }

    public DrawStart() {
        if (!this.isDrawStart) {
            this.isDrawStart = true
            this.drawCanvas.gameObject.SetActive(true);                        
            // UIManager.Ins.SetDefaultPlayerController(false);
            UIManager.instance.SetDefaultPlayerController(false);
            this.DrawPanelInit();
            this.SetDrawingMode(DrawMode.Consonant);
            this.StartCoroutine(this.OnDrawStart());
        }
        else {
            Debug.LogWarning("Drawing is already Start");
        }
    }

    private SetDrawingMode(mode : DrawMode) {
        if (this.drawMode == mode) return;
        
        this.drawMode = mode;
        if (this.drawMode == DrawMode.Consonant) {
            this.consBtn.GetComponent<Image>().sprite = this.selectedImage;
            this.consBtn.GetComponentInChildren<Text>().color = Color.white;
            this.vowelBtn.GetComponent<Image>().sprite = this.unselectedImage;
            this.vowelBtn.GetComponentInChildren<Text>().color = Color.black;
            this.drawIndexMax = this.consPresets.length - 1;
            this.consonantsParent.SetActive(true);
            this.vowelsParent.SetActive(false);
            // this.SwitchDrawImage(this.consPresets[0]);
        }
        else if (this.drawMode == DrawMode.Vowel) {
            this.consBtn.GetComponent<Image>().sprite = this.unselectedImage;
            this.consBtn.GetComponentInChildren<Text>().color = Color.black;
            this.vowelBtn.GetComponent<Image>().sprite = this.selectedImage;
            this.vowelBtn.GetComponentInChildren<Text>().color = Color.white;
            this.drawIndexMax = this.vowelPresets.length - 1;
            this.consonantsParent.SetActive(false);
            this.vowelsParent.SetActive(true);
            // this.SwitchDrawImage(this.vowelPresets[0]);
        }

        this.DrawIndex = 0;
    }

    private * OnDrawStart() {
        while (this.isDrawStart) {
            const mousePos : Vector3 = Input.mousePosition            
            if (Input.GetMouseButtonDown(0)) {
                this.DrawInputBegin(mousePos);
            }

            if (Input.GetMouseButton(0)) {
                this.OnDrawing(mousePos);
            }

            if (Input.GetMouseButtonUp(0)) {
                this.DrawInputEnd();
            }

            yield null;
        }
    }

    private DrawPanelInit() {
        this.drawPoints.forEach((value : GameObject, key : number) => {
            if (!value.IsDestroyed)
                GameObject.Destroy(value);
        });

        this.drawPoints.clear();
        this.drawNum = 0;
    }

    private CanDraw() : boolean {
        return this.imageTargeter.IsTargetHit();
    }

    private DrawInputBegin(pos : Vector3) {
        if (this.CanDraw()) {
            const vector2Pos : Vector2 = new Vector2(pos.x, pos.y);

            const worldPoint = this.GetScreenToWorldPoint(pos);            
            const mouseVec2 : Vector2 = new Vector2(worldPoint.x, worldPoint.y);

            const imageObj : GameObject = this.imageTargeter.GetImageAsPos(vector2Pos);
            if(imageObj == null) return;
            this.guideLineHandler = imageObj.GetComponent<GuideLineHandler>();           
            
            if (this.guideLineHandler.CanDrawLineStart(worldPoint)) {
                if (this.isDrawing) return;
                this.isDrawing = true;
                this.drawNum++;
                
                const drawLine : GameObject = GameObject.Instantiate<GameObject>(this.linePrefab, worldPoint, Camera.main.transform.rotation, this.drawPanel.transform);
                this.drawPoints.set(this.drawNum, drawLine);
            }
        }
    }

    private OnDrawing(pos : Vector3) {
        if (this.CanDraw() && this.isDrawing) {
            const worldPoint = this.GetScreenToWorldPoint(pos);

            const obj : GameObject = this.drawPoints.get(this.drawNum)
            if (obj == null) return;
            const line : LineRenderer = obj.GetComponent<LineRenderer>();
            
            const isDrawn : boolean = this.guideLineHandler.DrawingLine(worldPoint);

            if (isDrawn) {
                const hasNextLine = this.guideLineHandler.SetNextGuideLine(this.drawNum);
                if (hasNextLine)
                    this.DrawInputEnd(true);
                else {
                    this.DrawInputEnd();
                    const getNums = this.guideLineHandler.GetSuccessDrawNums();
                    getNums.forEach((value : number, index : number) => {
                        this.RemoveLine(value);
                    });
                }
                return;
            }

            const currentPosition = obj.transform.InverseTransformPoint(worldPoint);

            if (Vector3.Distance(currentPosition, this.previousPosition) > this.minDistance) {
                line.positionCount++;
                line.SetPosition(line.positionCount - 1, currentPosition);
                this.previousPosition = currentPosition;
            }
        }
        else {
            this.DrawInputEnd();
        }
    }

    private DrawInputEnd(isSuccess : boolean = false) {
        if (!this.isDrawing) return;
        if (!isSuccess) {
            this.RemoveLine(this.drawNum);
        }
        this.isDrawing = false;
        this.drawNum++;
    }

    private RemoveLine(index : number){
        GameObject.Destroy(this.drawPoints.get(index));
        this.drawPoints.delete(index);
    }

    private GetScreenToWorldPoint(mousePos: Vector3) {        
        mousePos.z = 1;         
        return Camera.main.ScreenToWorldPoint(mousePos);
    }

    private SwitchDrawImage(preset : DrawPreset) {
        if (this.currentDrawImages != null) {
            if (this.currentDrawImages.firstImage != null) this.currentDrawImages.firstImage.gameObject.SetActive(false);
            if (this.currentDrawImages.secondImage != null) this.currentDrawImages.secondImage.gameObject.SetActive(false);
            if (this.currentDrawImages.thirdImage != null) this.currentDrawImages.thirdImage.gameObject.SetActive(false);
        }

        if (preset.firstImage != null) preset.firstImage.gameObject.SetActive(true);
        if (preset.secondImage != null) preset.secondImage.gameObject.SetActive(true);
        if (preset.thirdImage != null) preset.thirdImage.gameObject.SetActive(true);

        this.currentDrawImages = preset;
    }

    private DrawFinish() {
        this.DrawPanelInit();
        this.StopCoroutine(this.OnDrawStart());
        this.drawCanvas.gameObject.SetActive(false);
        this.drawMode = null;
        this.DrawIndex = 0;
        this.isDrawStart = false;
        // this.SetDefaultPlayerController(true);
        UIManager.instance.SetDefaultPlayerController(true);
        this._interactionBtn.GetComponent<InteractionBtn>().ShowIcon();
    }
}

interface DrawPreset {
    firstImage : Image,
    secondImage : Image,
    thirdImage : Image
}

enum DrawMode {
    Vowel = "Drawing Vowel",
    Consonant = "Drawing Consonant"
}
