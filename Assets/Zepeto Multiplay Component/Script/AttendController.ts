import { TextMeshPro, TextMeshProUGUI } from 'TMPro';
import { Animator, Mathf, Transform, WaitForSeconds } from 'UnityEngine';
import { Button, Text } from 'UnityEngine.UI';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import GameManager from './GameManager';
import UIManager from './Manager/UIManager';
import { Attend, AttendPanel } from './TypeManager';
import HttpDataConnectionService from './HttpDataConnectionService';

export default class AttendController extends ZepetoScriptBehaviour {
    /* Properties */
    @SerializeField() private attendUI: Transform;
    private attendPanels: AttendPanel[] = [];
    private coinText: TextMeshProUGUI;
    private _dateIndex: number = -1;
    public get dateIndex(): number {
        return this._dateIndex;
    }
    public set dateIndex(value: number) {
        if (!this.attendPanels || this.attendPanels.length < 20 || value < 0 || value > this.attendPanels.length) {
        console.error(`NOT_MATCHED`);
        } else {
        this._dateIndex = value;
        console.log(`this._dateIndex ${this._dateIndex}`);
        }
    }

    private readonly coinList = [5, 50, 100, 200, 500];
    private attending: boolean = false;
    private isFirst : boolean = true;

    private _month: string;
    public get month(): string { return this._month; }
    private set month(value: string) { this._month = value; }

    private _dateId: string;
    public get dateId(): string { return this._dateId; }
    private set dateId(value: string) { this._dateId = value; }

    @SerializeField() exceptIds : string[] = [];
    
    // private _yesterDateId: string;
    // public get yesterDateId(): string { return this._yesterDateId; }
    // private set yesterDateId(value: string) { this._yesterDateId = value; }

    /* GameManager */
    public RemoteStart() {
        /* Init Id */
        const today = new Date();
        // const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() -1);

        this.month = `${today.getMonth() +1}`;

        this.dateId = this.FormatDate(today);
        // this.yesterDateId = this.FormatDate(yesterday);

        /* Set Init */
        this.SetAttendUI();
    }

    private ShowDialogue() {
        if (this.isFirst) {
            this.isFirst = false;
            // UIManager.Instance.SetDialogueUI(this.dialgueStrings, null);
            UIManager.instance.SetDialogueUI(null, 0, 1, 2);
        }
    }

    private SetAttendUI() {
        //
        const closeButton = this.attendUI.GetChild(1).GetComponent<Button>();
        const attendGroup = this.attendUI.GetChild(2);
        const coinUI = this.attendUI.GetChild(3);

        // Attend
        closeButton.onClick.AddListener(() => {
            // if (coinUI.gameObject.activeSelf) return;
            // if (this.attending) return;

            this.ShowDialogue();
            this.attendUI.gameObject.SetActive(false);
        });

        for (let i = 0; i < attendGroup.childCount; i++) {
            const attendPanel = attendGroup.GetChild(i);
            const highlight = attendPanel.GetChild(0);
            const lock = attendPanel.GetChild(1);

            attendPanel.gameObject.SetActive(false);

            const data: AttendPanel = {
                gameObject: attendPanel.gameObject,
                transform: attendPanel,
                highlight: highlight.gameObject,
                lock: lock.gameObject,
                index: i,
            };
            this.attendPanels.push(data);
        }

        // Coin
        const yButton_coin = coinUI.GetChild(1).GetComponent<Button>();
        const nButton_coin = coinUI.GetChild(2).GetComponent<Button>();

        yButton_coin.onClick.AddListener(() => {
            coinUI.gameObject.SetActive(false);
            //   if (this.attending) this.OnGetCoin(this.dateIndex);
        });

        nButton_coin.onClick.AddListener(() => {
            coinUI.gameObject.SetActive(false);
            //   if (this.attending) this.OnGetCoin(this.dateIndex);
        });
        this.coinText = coinUI.GetChild(3).GetComponent<TextMeshProUGUI>();
        coinUI.gameObject.SetActive(false);
    }

    public UpdateAttendData(attendData: Attend) {
        /* new version */
        const isFirst = attendData.lastDate == null || attendData.lastDate == "" || attendData.lastDate.length < 1;
        if(isFirst) {
            attendData.lastDate = `0_0_0`;
            attendData.count = 0;
        }

        // Attend Check Last Month
        const date = attendData.lastDate.split("_");
        if(this.month != date[1]) {
            attendData.count = 0;
        }

        // Lock
        for(let i=0; i<attendData.count; i++) this.LockCoin(i);
        this.dateIndex = attendData.count;

        // This Month complete
        const complete = attendData.count >= 20;
        if(complete) {
            const attend = GameManager.instance.playerDB.attend;
            if (attend.lastDate != this.dateId) attend.lastDate = this.dateId;
            this.ShowDialogue();
            return;
        }
        // Attend Already Today
        if(this.dateId == attendData.lastDate) {
            this.ShowDialogue();
            return;
        }
        // Set Date
        const today = this.attendPanels[attendData.count];
        today.gameObject.SetActive(true);
        today.highlight.SetActive(true);
        today.lock.SetActive(false);
        this.OnGetCoin(this.dateIndex);
        const coin = this.coinList[this.SelectCoin(attendData.count)];
        this.coinText.text = this.FormatText(coin);
        this.StartCoroutine(this.AttendChecker(attendData));
    }

    /* Animation */
    private *AttendChecker(attendData: Attend) {
        const wait = new WaitForSeconds(1);
        this.attending = true;

        if(this.exceptIds.includes(GameManager.instance.zepetoId)) return;

        UIManager.instance.SetDefaultPlayerController(false);
        yield wait;

        this.attendUI.gameObject.SetActive(true);
        yield wait;

        const coinUI = this.attendUI.GetChild(3);
        coinUI.gameObject.SetActive(true);
        const anim = coinUI.GetComponent<Animator>();
        anim.SetTrigger(`Active`);
    }

    private LockCoin(index: number) {
        if (index < 0) return;

        const data = this.attendPanels[index];
        data.gameObject.SetActive(true);
        data.highlight.SetActive(false);
        data.lock.SetActive(true);
    }

    private OnGetCoin(index: number) {
        if (index < 0) return;

        // Lock
        this.LockCoin(index);

        // Update Attend Data
        const attend = GameManager.instance.playerDB.attend;
        attend.count = this.NextDate(index);
        attend.lastDate = this.dateId;
        console.log(`client last data : ${attend.lastDate}`);
        // Update Coin Data
        const coin = this.coinList[this.SelectCoin(index)];
        GameManager.instance.playerDB.wonderCoin = Mathf.Clamp(GameManager.instance.playerDB.wonderCoin +coin, 0, HttpDataConnectionService.coinLimit);

        // Finish
        UIManager.instance.SetDefaultPlayerController(true);
        UIManager.instance.UpdateCoinUI()
        this.attending = false;
    }

    /** Methods **/
    private SelectCoin(index: number) {
        if ((index + 1) % 5 == 0) return Mathf.Floor((index + 1) / 5);
        return 0;
    }

    private FormatText(coin: number) {
        return `COIN ${coin}`;
    }

    private NextDate(index: number) {
        return index + 1 < 20 ? index + 1 : 0;
    }

    private FormatDate(date: Date) {
        return `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
    }
}
