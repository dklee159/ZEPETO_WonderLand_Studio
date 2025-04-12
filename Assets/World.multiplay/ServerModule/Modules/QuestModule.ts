import { SandboxPlayer } from 'ZEPETO.Multiplay';
// import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { IModule } from '../IModule';

export default class QuestModule extends IModule {
    OnCreate(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    OnJoin(client: SandboxPlayer): Promise<void> {
        throw new Error('Method not implemented.');
    }
    OnLeave(client: SandboxPlayer): Promise<void> {
        throw new Error('Method not implemented.');
    }
    OnTick(deltaTime: number): void {
        throw new Error('Method not implemented.');
    }

    Start() {    

    }

}