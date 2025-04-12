import { List$1 } from 'System.Collections.Generic';
import { GameObject, Transform, Sprite, Debug , Animator, Camera, RenderTexture, Input, Ray, RaycastHit, Physics, Vector3, Vector2, Quaternion } from 'UnityEngine';
import { Image, Button, RawImage, GraphicRaycaster } from 'UnityEngine.UI';
import { ZepetoCharacterCreator, ZepetoPlayers, SpawnInfo, ZepetoCharacter, ZepetoPlayer } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { ZepetoWorldContent } from 'ZEPETO.World';
import UIManager from './UIManager';
import { AnimParamName } from './AnimationManager';
import { TOAST_MESSAGE } from '../TypeManager';
import GameManager from '../GameManager';
import ImageTargeter from '../MiniGames/Draw/ImageTargeter';
import { PointerEventData } from 'UnityEngine.EventSystems';
import RaycastUtilities from '../MiniGames/Draw/RaycastUtilities';
import QuestManager from './QuestManager';

export default class PhotoBoothManager extends ZepetoScriptBehaviour {
    @SerializeField() private photoBoothUI : GameObject;
    @SerializeField() private uiCloseBtn : Button;
    @SerializeField() private photoBooths : Transform [] = [];
    @SerializeField() private renderCamera : Camera;
    @SerializeField() private renderTexture : RenderTexture;

    /* Angle */
    @Header("Angle")
    @SerializeField() private anglePanel : GameObject;
    @SerializeField() private highAngleBtn : Button;
    @SerializeField() private frontAngleBtn : Button;
    @SerializeField() private lowAngleBtn : Button;

    /* Pose */
    @Header("Pose")
    @SerializeField() private posePanel : GameObject;
    @SerializeField() private poseChoiceBtn : Button;
    @SerializeField() private highAnglePoseSprites : Sprite[] = [];
    @SerializeField() private frontAnglePoseSprites : Sprite[] = [];
    @SerializeField() private lowAnglePoseSprites : Sprite[] = [];

    /* Deco */
    @Header("Deco")
    @SerializeField() private decoPanel : GameObject;
    @SerializeField() private frameImage : Image;
    @SerializeField() private renderImage : RawImage;
    @SerializeField() private selectedFrame : Transform;
    @SerializeField() private deselectedFrame : Transform;
    @SerializeField() private frameMenu : Transform;
    @SerializeField() private stickerMenu : Transform;
    @SerializeField() private frameBtn : Button;
    @SerializeField() private stickerBtn : Button;
    @SerializeField() private feedBtn : Button;
    @SerializeField() private saveBtn : Button;
    @SerializeField() private selectedMenuSprite : Sprite;
    @SerializeField() private deselectedMenuSprite : Sprite;
    @SerializeField() private frameSprites : Sprite[] = [];
    @SerializeField() private stickers : Transform[] = [];
    
    /* Properties */
    private isPhotoBoothStart : boolean = false;
    private imageTargeter : ImageTargeter;
    private dummys : DummyInfo[] = [];
    private selectedAngle : Angle;
    private selectedPose : List$1<Button> = new List$1<Button>();
    private poseSprites : Sprite[] = [];
    private currentFrame : Button;
    private poseMapping : Map<Button, PoseInfo> = new Map<Button, PoseInfo>();
    private frameMapping : Map<Button, Sprite> = new Map<Button, Sprite>();
    private stickerMapping : Map<Button, Transform> = new Map<Button, Transform>();
    private selectedImage : Transform;
    
    private poseOffsets : Map<Pose, PoseOffset> = new Map([
        [Pose.Low_Pose_8,{Pos : new Vector3(0.34, -0.84, 0.215), Rot : Quaternion.Euler(-24, -25, 4.3)}],
        [Pose.Low_Pose_6,{Pos : new Vector3(0.169, -0.847, 0.146), Rot : Quaternion.Euler(-16.3, -14.1, 0.58)}],
        [Pose.Low_Pose_5,{Pos : new Vector3(-0.101, -1.044, 0.198), Rot : Quaternion.Euler(-48.3, 4.68, 0)}],
        [Pose.Front_Pose_6,{Pos : new Vector3(-0.517, -0.085, 0.216), Rot : Quaternion.Euler(1.482, 38.77, -0.63)}],
        [Pose.Low_Pose_4,{Pos : new Vector3(0.088, -1.02, 0.237), Rot : Quaternion.Euler(-36.7, -5.956, 5.1)}],
        [Pose.Low_Pose_1,{Pos : new Vector3(0.125, -1.065, 0.252), Rot : Quaternion.Euler(-39.2, -7.7, -1.85)}],
        [Pose.High_Pose_3,{Pos : new Vector3(0.197, 0.104, 0.36), Rot : Quaternion.Euler(48.8, -16.53, 0)}],
        [Pose.High_Pose_8,{Pos : new Vector3(0.107, 0.47, 0.36), Rot : Quaternion.Euler(50.85, -6.3, 0)}],
        [Pose.High_Pose_10,{Pos : new Vector3(-0.101, 0.223, 0.097), Rot : Quaternion.Euler(31.1, 2.172, 0)}],
    ]);

    Start() {    
        this.imageTargeter = this.transform.GetComponent<ImageTargeter>();
        this.imageTargeter.AddTargetRawImage(this.renderImage);
        // add button listener
        this.uiCloseBtn.onClick.AddListener(() => {
            this.PhotoBoothFinish();
        });

        this.highAngleBtn.onClick.AddListener(() => {
            this.selectedAngle = Angle.High;
            this.OnAngleSelected();
        });

        this.frontAngleBtn.onClick.AddListener(() => {
            this.selectedAngle = Angle.Front;
            this.OnAngleSelected();
        });

        this.lowAngleBtn.onClick.AddListener(() => {
            this.selectedAngle = Angle.Low;
            this.OnAngleSelected();
        });

        this.poseChoiceBtn.onClick.AddListener(() => {
            if (this.selectedPose.Count < 4) return;
            this.OnSelectedPose();
        });

        this.frameBtn.onClick.AddListener(() => {
            this.SetMenu(this.frameMenu);
        })

        this.stickerBtn.onClick.AddListener(() => {
            this.SetMenu(this.stickerMenu);
        })

        this.feedBtn.onClick.AddListener(() => {
            ZepetoWorldContent.CreateFeed(this.renderTexture, "#K-WONDERLAND #WHATEVERYOUDREAM", (result) => {
                Debug.Log(result);
                QuestManager.Instance.OnPostFeed();
                GameManager.instance.Toast(TOAST_MESSAGE.feedCompleted);
            });
            this.PhotoBoothFinish()
        })
        
        this.saveBtn.onClick.AddListener(() => {
            ZepetoWorldContent.SaveToCameraRoll(this.renderTexture, (result) => {
                Debug.Log(result);
                GameManager.instance.Toast(TOAST_MESSAGE.screenShotSaveCompleted);
            });
            this.PhotoBoothFinish()
        });

        // 포즈 선택 버튼 이벤트 등록
        const posePanelChildNum = this.posePanel.transform.childCount;
        for (let i = 0; i < posePanelChildNum - 1; i++) {
            const poseBtn = this.posePanel.transform.GetChild(i).GetComponent<Button>();
            const defaultPoseInfo : PoseInfo = {
                Pose : Pose.None,
                Selected : false,
            }
            this.poseMapping.set(poseBtn, defaultPoseInfo);

            poseBtn.onClick.AddListener(() => {
                const poseInfo = this.poseMapping.get(poseBtn);
                this.OnPoseClicked(poseBtn, poseInfo);
            });
        }

        // 프레임 선택 버튼 이벤트 등록
        const frameMenuChildNum = this.frameMenu.transform.childCount;
        for (let i = 0; i < frameMenuChildNum; i++) {
            const frameBtn = this.frameMenu.transform.GetChild(i).GetComponent<Button>();

            this.frameMapping.set(frameBtn, this.frameSprites[i + 1]);
            frameBtn.onClick.AddListener(() => {
                this.OnFrameClicked(frameBtn);
            });
        }

        // 스티커 선택 버튼 이벤트 등록
        const stickerMenuChildNum = this.stickerMenu.transform.childCount;
        for (let i = 0; i < stickerMenuChildNum; i++) {
            const stickerBtn = this.stickerMenu.transform.GetChild(i).GetComponent<Button>();
            
            this.stickerMapping.set(stickerBtn, this.stickers[i]);
            stickerBtn.onClick.AddListener(() => {
                this.OnStickerClicked(stickerBtn);
            });
        }
    }

    public PhotoBoothStart() {
        if (!this.isPhotoBoothStart) {
            this.isPhotoBoothStart = true;
            this.renderCamera.gameObject.SetActive(true);
            this.photoBoothUI.SetActive(true);
            this.anglePanel.SetActive(true);
            this.posePanel.SetActive(false);
            this.decoPanel.SetActive(false);
            this.frameImage.sprite = this.frameSprites[0];
            this.deselectedFrame.gameObject.SetActive(true);
            this.selectedFrame.gameObject.SetActive(false);

            // this.resultPanel.SetActive(false);
            this.selectedPose.Clear();
            this.currentFrame = null;

            UIManager.instance.SetDefaultButton(false);
            UIManager.instance.SetDefaultPlayerController(false);

            this.photoBooths.forEach((photoBooth : Transform, index : number) => {
                photoBooth.gameObject.SetActive(true);
                if (this.dummys.length > 0) return;
                const spawnTransform = photoBooth.GetChild(1);
                const spawnInfo = new SpawnInfo();
                spawnInfo.position = spawnTransform.position;
                spawnInfo.rotation = spawnTransform.rotation;
                
                // ZepetoCharacterCreator.CreateModelByUserId(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId, spawnInfo, character => {
                //     const anim = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.ZepetoAnimator.GetComponent<Animator>();
                //     character.AddComponent(anim);
                //     this.dummys[index] = {
                //         Character: character,
                //         Anim: anim
                //     }
                //     anim.SetInteger("WonderState", 302);
                // });

                ZepetoCharacterCreator.CreateByUserId(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId, spawnInfo, (character) => {
                    // character.StateMachine.Stop();
                    const anim = character.ZepetoAnimator;
                    character.transform.SetParent(photoBooth);
                    this.dummys[index] = {
                        Character : character,
                        Anim : anim
                    }
                    anim.SetInteger("WonderState", 302);
                });
            });

            const frameMenuChildNum = this.frameMenu.transform.childCount;
            for (let i = 0; i< frameMenuChildNum; i++) {
                this.frameMenu.transform.GetChild(i).GetChild(0).gameObject.SetActive(false);
            }

            this.stickers.forEach((sticker : Transform, index : number) => {
                this.stickerMenu.transform.GetChild(index).GetChild(0).gameObject.SetActive(false);
                sticker.gameObject.SetActive(false);
            });
        }
        else {
            Debug.Log("Photo Booth Is Already Started");
        }
    }

    private SetMenu(menu : Transform) {
        if (menu.gameObject.activeInHierarchy) return;

        if (menu == this.frameMenu) {
            this.frameMenu.gameObject.SetActive(true);
            this.stickerMenu.gameObject.SetActive(false);
            this.frameBtn.GetComponent<Image>().sprite = this.selectedMenuSprite;
            this.stickerBtn.GetComponent<Image>().sprite = this.deselectedMenuSprite;
        }
        else if (menu == this.stickerMenu) {
            this.stickerMenu.gameObject.SetActive(true);
            this.frameMenu.gameObject.SetActive(false);
            this.frameBtn.GetComponent<Image>().sprite = this.deselectedMenuSprite;
            this.stickerBtn.GetComponent<Image>().sprite = this.selectedMenuSprite;
        }
    }

    private OnPoseClicked(poseBtn : Button, poseInfo : PoseInfo) {
        const isSelected = poseInfo.Selected;
        const pose = poseInfo.Pose;

        if (!isSelected) {
            if (this.selectedPose.Count >= 4) return;
            this.selectedPose.Add(poseBtn);
            if (this.selectedPose.Count == 4) this.poseChoiceBtn.gameObject.SetActive(true);
        }
        else {
            if (this.poseChoiceBtn.gameObject.activeInHierarchy) this.poseChoiceBtn.gameObject.SetActive(false);
            this.selectedPose.Remove(poseBtn);
        }

        const selectedImage = poseBtn.transform.GetChild(1);
        selectedImage.gameObject.SetActive(!isSelected);

        const changed : PoseInfo = {
            Pose : pose,
            Selected : !isSelected
        }
        
        this.poseMapping.set(poseBtn, changed);
    }

    private OnFrameClicked(frameBtn : Button) {
        const selectedImage = frameBtn.transform.GetChild(0);
        
        if (this.currentFrame == frameBtn) {
            selectedImage.gameObject.SetActive(false);
            this.currentFrame = null;
            this.frameImage.sprite = this.frameSprites[0];
            this.deselectedFrame.gameObject.SetActive(true);
            this.selectedFrame.gameObject.SetActive(false);
        }
        else {
            if (this.currentFrame != null) this.currentFrame.transform.GetChild(0).gameObject.SetActive(false);
            selectedImage.gameObject.SetActive(true);
            this.currentFrame = frameBtn;

            const frameSprite = this.frameMapping.get(frameBtn);
            this.frameImage.sprite = frameSprite;
            
            this.selectedFrame.gameObject.SetActive(true);
            this.deselectedFrame.gameObject.SetActive(false);
        }
    }

    private OnStickerClicked(stickerBtn : Button) {
        const sticker = this.stickerMapping.get(stickerBtn);
        stickerBtn.transform.GetChild(0).gameObject.SetActive(!sticker.gameObject.activeInHierarchy);
        sticker.gameObject.SetActive(!sticker.gameObject.activeInHierarchy);
    }

    private OnAngleSelected() {
        this.anglePanel.SetActive(false);
        let posePreset : Pose[] = [];

        // set pose panel by selected angle
        switch(this.selectedAngle) {
            case Angle.High:
                this.poseSprites = this.highAnglePoseSprites;
                posePreset.push(Pose.High_Pose_1);
                posePreset.push(Pose.High_Pose_2);
                posePreset.push(Pose.High_Pose_3);
                posePreset.push(Pose.High_Pose_4);
                posePreset.push(Pose.High_Pose_5);
                posePreset.push(Pose.High_Pose_6);
                posePreset.push(Pose.High_Pose_7);
                posePreset.push(Pose.High_Pose_8);
                posePreset.push(Pose.High_Pose_9);
                posePreset.push(Pose.High_Pose_10);
                this.photoBooths.forEach((booth : Transform) => {
                    const camera = booth.GetChild(0).GetChild(0);
                    const pos = booth.GetChild(0).GetChild(1).position;
                    const rot = booth.GetChild(0).GetChild(1).rotation;
                    camera.position = pos;
                    camera.rotation = rot;
                });
                break;
            case Angle.Front:
                this.poseSprites = this.frontAnglePoseSprites;
                posePreset.push(Pose.Front_Pose_1);
                posePreset.push(Pose.Front_Pose_2);
                posePreset.push(Pose.Front_Pose_3);
                posePreset.push(Pose.Front_Pose_4);
                posePreset.push(Pose.Front_Pose_5);
                posePreset.push(Pose.Front_Pose_6);
                posePreset.push(Pose.Front_Pose_7);
                posePreset.push(Pose.Front_Pose_8);
                this.photoBooths.forEach((booth : Transform) => {
                    const camera = booth.GetChild(0).GetChild(0);
                    const pos = booth.GetChild(0).GetChild(2).position;
                    const rot = booth.GetChild(0).GetChild(2).rotation;
                    camera.position = pos;
                    camera.rotation = rot;
                });
                break;
            case Angle.Low:
                this.poseSprites = this.lowAnglePoseSprites;
                posePreset.push(Pose.Low_Pose_1);
                posePreset.push(Pose.Low_Pose_2);
                posePreset.push(Pose.Low_Pose_3);
                posePreset.push(Pose.Low_Pose_4);
                posePreset.push(Pose.Low_Pose_5);
                posePreset.push(Pose.Low_Pose_6);
                posePreset.push(Pose.Low_Pose_7);
                posePreset.push(Pose.Low_Pose_8);
                this.photoBooths.forEach((booth : Transform) => {
                    const camera = booth.GetChild(0).GetChild(0);
                    const pos = booth.GetChild(0).GetChild(3).position;
                    const rot = booth.GetChild(0).GetChild(3).rotation;
                    camera.position = pos;
                    camera.rotation = rot;
                });
                break;
            default:
                break;
        }
        
        const posePanelChildNum = this.posePanel.transform.childCount;
        const poseNum = this.poseSprites.length;

        for (let i = 0; i < posePanelChildNum - 1; i++) {
            this.posePanel.transform.GetChild(i).gameObject.SetActive(false);
        }

        for (let i = 0; i < poseNum; i++) {
            const poseChild = this.posePanel.transform.GetChild(i);
            const poseBtn = poseChild.GetComponent<Button>();
            const poseImage = poseChild.GetChild(0);
            const poseSelected = poseChild.GetChild(1);

            const poseInfo : PoseInfo = {
                Pose : posePreset[i],
                Selected : false
            }

            this.poseMapping.set(poseBtn, poseInfo);
            poseChild.gameObject.SetActive(true);
            poseImage.GetComponent<Image>().sprite = this.poseSprites[i];
            poseSelected.gameObject.SetActive(false);
        }
        
        this.poseChoiceBtn.gameObject.SetActive(false);
        this.posePanel.SetActive(true);
    }

    private OnSelectedPose() {
        this.posePanel.SetActive(false);
        this.decoPanel.SetActive(true);
        this.deselectedFrame.gameObject.SetActive(true);
        this.SetMenu(this.frameMenu);

        this.dummys.forEach((info : DummyInfo, index : number) => {
            const character = info.Character;
            const anim = info.Anim;
            const poseInfo = this.poseMapping.get(this.selectedPose[index]);
            const pose = poseInfo.Pose;
            Debug.Log(pose);
            character.StateMachine.constraintStateAnimation = true;
            character.StateMachine.Stop();
            const poseOffset = this.poseOffsets.get(pose);
            if (poseOffset != null) {
                const camera = this.photoBooths[index].GetChild(0).GetChild(0);
                camera.localPosition = poseOffset.Pos;
                camera.localRotation = poseOffset.Rot;
            }
            anim.SetInteger(AnimParamName.WonderState, pose);
        });

        this.StartCoroutine(this.CheckStickerInput());
    }

    private * CheckStickerInput() {
        while (true) {
            if (Input.GetMouseButtonDown(0)) {
                this.OnMouseButtonDown();
            }
            if (Input.GetMouseButton(0)) {
                this.OnMouseButtonMove();
            }
            if (Input.GetMouseButtonUp(0)) {
                this.OnMouseButtonUp();
            }
            yield null;
        }
    }

    private OnMouseButtonDown() {
        const pointVector = this.imageTargeter.GetConvertPoint(true);
        if (pointVector) {
            const gr = this.renderCamera.transform.GetChild(0).GetComponent<GraphicRaycaster>();
            const pointerData = new PointerEventData(null);
            pointerData.position = new Vector2(pointVector.x, pointVector.y);
            const obj = RaycastUtilities.GraphicRay(gr, pointerData);
            this.selectedImage = obj == null ? null : obj.transform;
            if (this.selectedImage) this.selectedImage.SetAsLastSibling();
        }
    }

    private OnMouseButtonMove() {
        if (this.selectedImage) {
            const pointVector = this.imageTargeter.GetConvertPoint();
            this.selectedImage.transform.localPosition = pointVector;
        }
    }

    private OnMouseButtonUp() {
        if (this.selectedImage != null) this.selectedImage == null;
    }

    private PhotoBoothFinish() {
        if (this.isPhotoBoothStart) {
            this.isPhotoBoothStart = false;
            this.renderCamera.gameObject.SetActive(false);
            this.photoBoothUI.SetActive(false);
            this.anglePanel.SetActive(false);
            this.posePanel.SetActive(false);
            this.decoPanel.SetActive(false);
            // this.resultPanel.SetActive(false);
            this.frameMenu.gameObject.SetActive(false);
            this.stickerMenu.gameObject.SetActive(false);
            this.StopCoroutine(this.CheckStickerInput());

            this.photoBooths.forEach((booth : Transform) => {
                booth.gameObject.SetActive(false);
            });
            UIManager.instance.SetDefaultButton(true);
            UIManager.instance.SetDefaultPlayerController(true);
        }
    }
}

interface DummyInfo {
    Character : ZepetoCharacter,
    Anim : Animator
}

interface PoseInfo {
    Pose : Pose,
    Selected : boolean,
}

interface PoseOffset {
    Pos : Vector3,
    Rot : Quaternion
}

enum Angle {
    High = 300,
    Front = 400,
    Low = 500,
}

enum Pose {
    None = -1,
    High_Pose_1 = 301,
    High_Pose_2 = 302,
    High_Pose_3 = 303,
    High_Pose_4 = 304,
    High_Pose_5 = 305,
    High_Pose_6 = 306,
    High_Pose_7 = 307,
    High_Pose_8 = 308,
    High_Pose_9 = 309,
    High_Pose_10 = 310,

    Front_Pose_1 = 401,
    Front_Pose_2 = 402,
    Front_Pose_3 = 403,
    Front_Pose_4 = 404,
    Front_Pose_5 = 405,
    Front_Pose_6 = 406,
    Front_Pose_7 = 407,
    Front_Pose_8 = 408,

    Low_Pose_1 = 501,
    Low_Pose_2 = 502,
    Low_Pose_3 = 503,
    Low_Pose_4 = 504,
    Low_Pose_5 = 505,
    Low_Pose_6 = 506,
    Low_Pose_7 = 507,
    Low_Pose_8 = 508,
}