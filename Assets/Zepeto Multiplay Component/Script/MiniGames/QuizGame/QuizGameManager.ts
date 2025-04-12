import { List$1 } from 'System.Collections.Generic';
import { Sprite, Random, Mathf, Transform, GameObject } from 'UnityEngine';
import { Image, Button, Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import UIManager from '../../Manager/UIManager';
import QuestManager from '../../Manager/QuestManager';
import LocalizeExternText from '../../Lang/LocalizeExternText';

export default class QuizGameManager extends ZepetoScriptBehaviour {
    @SerializeField() private quizUI : GameObject;
    @SerializeField() private quizPanel : GameObject;
    @SerializeField() private resultPanel : Transform;
    @SerializeField() private correctList : Transform[] = [];
    
    /* Images */
    @Header("Images")
    @SerializeField() private quizImage : Image;
    @SerializeField() private scoreImage : Image;

    /* Buttons */
    @Header("Buttons")
    @SerializeField() private quizSelectBtns : Button[] =[];
    @SerializeField() private closeBtn : Button;

    /* Sprites */
    @Header("Sprites")
    @SerializeField() private quizSprites : Sprite[] = [];
    @SerializeField() private correctSprite : Sprite;
    @SerializeField() private incorrectSprite : Sprite

    @Header("Texts")
    @SerializeField() private indexText : Text;

    /* Variables */
    private quizIndex : number = 0;
    private maxIndex = 5;
    private correctBtn : Button;
    private quizStrings : string[] = ["가족", "나비", "다람쥐", "라면", "마늘", "바다", "사자", "아기", "자동차", "차키", "카메라", "타조", "파랑", "하늘"];
    private quizMapping : Map<string, Sprite> = new Map<string, Sprite>();
    private score : number = 0;
    private selectedIndex : List$1<number> = new List$1<number>();

    Start() {
        this.quizStrings.forEach((quizName : string, index : number) => {
            this.quizMapping.set(quizName, this.quizSprites[index]);
        });

        this.quizSelectBtns.forEach((btn : Button, index : number) => {
            btn.onClick.AddListener(() => {
                this.OnBtnClick(btn);
            })
        });

        this.closeBtn.onClick.AddListener(() => {
            this.FinishQuiz();
        });
    }

    public StartQuiz() {
        this.quizUI.SetActive(true);
        this.quizPanel.SetActive(true);
        this.resultPanel.gameObject.SetActive(false);
        this.correctList.forEach((correct : Transform) => {
            correct.gameObject.SetActive(false);
        });
        this.quizIndex = 0;
        this.score = 0;
        this.indexText.text = `${this.indexText.GetComponent<LocalizeExternText>().text})${1}`;
        this.selectedIndex.Clear();
        UIManager.instance.SetDefaultButton(false);
        UIManager.instance.SetDefaultPlayerController(false);
        this.SetQuiz();
    }

    private OnBtnClick(btn : Button) {
        if (btn == this.correctBtn) {
            this.correctList[this.quizIndex].GetComponent<Image>().sprite = this.correctSprite
            this.score += 20;
        }
        else {
            this.correctList[this.quizIndex].GetComponent<Image>().sprite = this.incorrectSprite;
        }
        
        this.correctList[this.quizIndex].gameObject.SetActive(true);

        if (this.quizIndex >= this.maxIndex - 1) {
            this.ShowResult();
        }
        else {
            this.SetQuiz();
        }
        this.indexText.text = `${this.indexText.GetComponent<LocalizeExternText>().text})${this.quizIndex + 2}`;

        this.quizIndex++;
    }

    private SetQuiz() {
        
        
        let correctIndex = Mathf.Floor(Random.Range(0, this.quizStrings.length));

        if (this.selectedIndex.Contains(correctIndex)) {
            while(true) {
                correctIndex = Mathf.Floor(Random.Range(0, this.quizStrings.length));
                if (!this.selectedIndex.Contains(correctIndex)) break;
            } 
        }

        this.selectedIndex.Add(correctIndex);
        const incorrectIndex_1 = Mathf.Floor(Random.Range(1, 5)) + correctIndex;
        const incorrectIndex_2 = Mathf.Floor(Random.Range(1, 5)) + incorrectIndex_1;
        const incorrectIndex_3 = Mathf.Floor(Random.Range(1, 5)) + incorrectIndex_2;

        const incorrectCheck_1 = incorrectIndex_1 >= this.quizStrings.length ? incorrectIndex_1 - this.quizStrings.length : incorrectIndex_1;
        const incorrectCheck_2 = incorrectIndex_2 >= this.quizStrings.length ? incorrectIndex_2 - this.quizStrings.length : incorrectIndex_2;
        const incorrectCheck_3 = incorrectIndex_3 >= this.quizStrings.length ? incorrectIndex_3 - this.quizStrings.length : incorrectIndex_3;

        const correctString = this.quizStrings[correctIndex];
        const correctImage = this.quizMapping.get(correctString);
        this.quizImage.sprite = correctImage;

        const incorrectString_1 = this.quizStrings[incorrectCheck_1];
        const incorrectString_2 = this.quizStrings[incorrectCheck_2];
        const incorrectString_3 = this.quizStrings[incorrectCheck_3];

        const correctButtonIndex = Mathf.Floor(Random.Range(0,4));
        if (correctButtonIndex == 0) {
            this.quizSelectBtns[0].GetComponentInChildren<Text>().text = correctString;
            this.correctBtn = this.quizSelectBtns[0];
            this.quizSelectBtns[1].GetComponentInChildren<Text>().text = incorrectString_3;
            this.quizSelectBtns[2].GetComponentInChildren<Text>().text = incorrectString_2;
            this.quizSelectBtns[3].GetComponentInChildren<Text>().text = incorrectString_1;
        }
        else if (correctButtonIndex == 1) {
            this.quizSelectBtns[1].GetComponentInChildren<Text>().text = correctString;
            this.correctBtn = this.quizSelectBtns[1];
            this.quizSelectBtns[2].GetComponentInChildren<Text>().text = incorrectString_3;
            this.quizSelectBtns[3].GetComponentInChildren<Text>().text = incorrectString_2;
            this.quizSelectBtns[0].GetComponentInChildren<Text>().text = incorrectString_1;
        }
        else if (correctButtonIndex == 2) {
            this.quizSelectBtns[2].GetComponentInChildren<Text>().text = correctString;
            this.correctBtn = this.quizSelectBtns[2];
            this.quizSelectBtns[3].GetComponentInChildren<Text>().text = incorrectString_3;
            this.quizSelectBtns[0].GetComponentInChildren<Text>().text = incorrectString_2;
            this.quizSelectBtns[1].GetComponentInChildren<Text>().text = incorrectString_1;
        }
        else if (correctButtonIndex == 3) {
            this.quizSelectBtns[3].GetComponentInChildren<Text>().text = correctString;
            this.correctBtn = this.quizSelectBtns[3];
            this.quizSelectBtns[0].GetComponentInChildren<Text>().text = incorrectString_3;
            this.quizSelectBtns[1].GetComponentInChildren<Text>().text = incorrectString_2;
            this.quizSelectBtns[2].GetComponentInChildren<Text>().text = incorrectString_1;
        }
    }

    private ShowResult() {
        this.scoreImage.GetComponentInChildren<Text>().text = `${this.score}점`;
        this.quizPanel.SetActive(false);
        this.resultPanel.gameObject.SetActive(true);
    }

    private FinishQuiz() {
        QuestManager.Instance.OnPlayGame();
        this.resultPanel.gameObject.SetActive(false);
        this.quizUI.SetActive(false);
        UIManager.instance.SetDefaultButton(true);
        UIManager.instance.SetDefaultPlayerController(true);
    }
}
