import { IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConnection } from 'cgf.cameracontrol.main.core';
import { Ilogitechf310Config } from './Ilogitechf310Config';
export declare class F310 implements IHmi {
    private config;
    private logger;
    private readonly pad;
    private readonly moveInterpolation;
    private readonly _connectionEmitter;
    private altKeyState;
    private readonly mixer?;
    constructor(config: Ilogitechf310Config, logger: ILogger, mixerFactory: VideomixerFactory);
    private _connected;
    get connected(): boolean;
    set connected(v: boolean);
    subscribe(i: IConnection): void;
    unsubscribe(i: IConnection): void;
    dispose(): void;
    private changeConnection;
    private specialFunction;
}
