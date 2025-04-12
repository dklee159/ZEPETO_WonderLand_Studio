import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { GetLeaderboardResponse, GetRangeRankResponse, GetRankResponse, LeaderboardAPI, Rank, ResetRule, SetScoreResponse } from 'ZEPETO.Script.Leaderboard';
import { Users, WorldService, ZepetoWorldHelper } from 'ZEPETO.World';
import { Room, RoomData } from 'ZEPETO.Multiplay';
import UIManager from './UIManager';
import { Button, Text, Image } from 'UnityEngine.UI';
import MultiplayManager from '../../ZepetoScript/Common/MultiplayManager';
import { MESSAGE, Datas, ERROR, RankData, RankUI } from '../TypeManager';
import { Transform, Texture, Sprite, Rect, Texture2D, Vector2 } from 'UnityEngine';
import { Result } from 'UnityEngine.Networking.UnityWebRequest';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import DebugController from '../Controllers/DebugController';

export default class LeaderboardManager extends ZepetoScriptBehaviour {
    private readonly leaderboardId : string = "7039ce8b-4930-4fd3-8635-378fb3d94a44";

    @SerializeField() rankingUI : Transform;
    @SerializeField() rankingImage : Transform;
    @SerializeField() closeBtn : Button;

    @SerializeField() rankStart : number = 1;
    @SerializeField() rankFinish : number = 100;

    Start() {    
        this.closeBtn.onClick.AddListener(() => {
            this.rankingUI.gameObject.SetActive(false);
        });

        // LeaderboardAPI.GetLeaderboard(this.leaderboardId, (result : GetLeaderboardResponse) => {
        //     console.log(result.isSuccess);
        //     if(result.leaderboard) {
        //         console.log(`id : ${result.leaderboard.id}, name : ${result.leaderboard.name}`);
        //     }
        // }, (error : string) => {});
        
        LeaderboardAPI.GetRangeRank(this.leaderboardId, this.rankStart, this.rankFinish, ResetRule.week, true, (result : GetRankResponse) => {
            let rankList : string = "";
            let userIds : string[] = [];
            let scores : string[] = [];

            result.rankInfo.rankList.forEach((rank : Rank, index : number) => {
                // const player = ZepetoPlayers.instance.GetPlayerWithUserId(rank.member);
                const score = rank.score;

                userIds[userIds.length] = rank.member;
                scores[scores.length] = rank.score.toString();
            });
            ZepetoWorldHelper.GetUserInfo(userIds, (users) => {
                users.forEach((user, index) => {
                    rankList = rankList + `${user.zepetoId} ] ${scores[index]}\n`;
                });
                console.log(rankList);
            }, (error) => {

            });

            console.log(`rank num : ${result.rankInfo.rankList.length}`);
        });
    }

    public SetRanking(score : number) {
        if (DebugController.Instance.IsJetski) return;
        const _id = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.userId;
        const id : string[] = [_id];
        let getScore : number = 0;
        LeaderboardAPI.GetRank(this.leaderboardId, id, ResetRule.week, false, (result) => {
            getScore = result.rankInfo.myRank.score;
            LeaderboardAPI.SetScore(this.leaderboardId, getScore + score, (result : SetScoreResponse) => {
                console.log(result.score);
            },
            (error : string) => {
                console.log("leaderboard error");
            });
        });
    }

    public ShowRanking() {
        LeaderboardAPI.GetRangeRank(this.leaderboardId, 1, 10, ResetRule.week, false, (result : GetRankResponse) => {
            console.log(result.isSuccess);
            result.rankInfo.rankList.forEach((rank : Rank, index : number) => {
                const name = rank.name;
                const score = rank.score;

                const rankingInfo = this.rankingImage.GetChild(index);
                rankingInfo.GetChild(1).GetComponent<Text>().text = name;
                rankingInfo.GetChild(2).GetComponent<Text>().text = rank.score.toString();
                
                const mem = rank.member;
                ZepetoWorldHelper.GetProfileTexture(mem, (texture : Texture) => {
                    const rect : Rect = new Rect(0, 0, texture.width, texture.height);
                    const sprite = Sprite.Create(texture as Texture2D, rect, new Vector2(0.5, 0.5));
                    rankingInfo.GetChild(0).GetChild(0).GetComponent<Image>().sprite = sprite;
                },
                (error) => {
                    console.log(error);
                });
               
            });
        });
        this.rankingUI.gameObject.SetActive(true);
        console.log("Show Ranking");
    }
}
