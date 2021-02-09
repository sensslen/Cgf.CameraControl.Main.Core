import { IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConnection } from 'cgf.cameracontrol.main.core';
import { IRumblepad2Config } from './IRumblepad2Config';
export declare class Rumblepad2 implements IHmi {
    private config;
    private logger;
    private readonly pad;
    private readonly moveInterpolation;
    private readonly _connectionEmitter;
    private altKeyState;
    private readonly mixer?;
    constructor(config: IRumblepad2Config, logger: ILogger, mixerFactory: VideomixerFactory);
    private _connected;
    get connected(): boolean;
    set connected(v: boolean);
    subscribe(i: IConnection): void;
    unsubscribe(i: IConnection): void;
    dispose(): void;
    private changeConnection;
    private specialFunction;
}
