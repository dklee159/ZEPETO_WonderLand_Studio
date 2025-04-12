import { Coroutine, Transform, AudioSource, WaitForSeconds } from 'UnityEngine';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import UIManager from './UIManager';

export default class LanguageZoneManager extends ZepetoScriptBehaviour {
    @SerializeField() spawnPoint : Transform;
    @SerializeField() returnPoint : Transform;
    @SerializeField() bgm : AudioSource;
    // private dialgueStrings : string[] = ["K-랭귀지존에 온것을 환영해!\n이곳에서는 다양한 한글 단어를 들어보고 말해보고 써보는 공간이야.\n\n우선 책상에 앉아서 기초를 다지고\n너의 실력을 칠판에서 테스트 해봐!"];

    private soundCor : Coroutine;

    public MoveToLanguageZone() {
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        // const dialgueStrings : string[] = ["K-랭귀지존에 온것을 환영해!\n이곳에서는 다양한 한글 단어를 들어보고 말해보고 써보는 공간이야.\n\n우선 책상에 앉아서 기초를 다지고\n너의 실력을 칠판에서 테스트 해봐!"];
        UIManager.instance.SetDialogueUI(null, 3, 4, 5);
        // UIManager.Instance.SetDialogueUI(dialgueStrings, null);
        character.Teleport(this.spawnPoint.position, this.spawnPoint.rotation);
    }

    public ReturnToPoint() {
        const character = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character;
        character.Teleport(this.returnPoint.position, this.returnPoint.rotation);
    }

    public PlaySound(sfx : AudioSource) {
        sfx.Play();
        const audioLength = sfx.clip.length;
        if (this.soundCor) this.StopCoroutine(this.soundCor);
        this.soundCor = this.StartCoroutine(this.OnPlaySound(audioLength));
    }

    private * OnPlaySound(len : number) {
        this.bgm.volume = 0.1;

        yield new WaitForSeconds(len + 1);

        this.bgm.volume = 1;
    }
}