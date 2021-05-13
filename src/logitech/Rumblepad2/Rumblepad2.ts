import * as gamepadConfig from '@sensslen/node-gamepad/controllers/logitech/rumblepad2.json';

import { IConnection, IHmi, ILogger, IVideoMixer, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConfig as IGamepadConfig, NodeGamepad, ILogger as NodeGamepadLogger } from '@sensslen/node-gamepad';

import { EInputChangeDirection } from '../../ConfigurationHelper/EInputChangeDirection';
import { ERumblepadSpecialFunctionKey } from './ERumblepadSpecialFunctionKey';
import { ESpecialFunctionType } from '../../ConfigurationHelper/ESpecialFunctionType';
import { EventEmitter } from 'events';
import { IRumblepad2Config } from './IRumblepad2Config';
import { StrictEventEmitter } from 'strict-event-emitter-types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const interpolate = require('everpolate').linear;

enum EAltKeyState {
    default,
    alt,
    altLower,
}

export class Rumblepad2 implements IHmi {
    private readonly pad: NodeGamepad;
    private readonly moveInterpolation: number[][] = [
        [0, 63, 31, 127, 128, 160, 172, 255],
        [255, 70, 20, 0, 0, -20, -70, -255],
    ];
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();
    private altKeyState = EAltKeyState.default;
    private readonly mixer?: IVideoMixer;

    private _connected = false;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
    }

    constructor(private config: IRumblepad2Config, private logger: ILogger, mixerFactory: VideomixerFactory) {
        const padConfig = gamepadConfig as IGamepadConfig;
        if (config.serialNumber) {
            padConfig.serialNumber = config.serialNumber;
        }

        const gamepadLogger: NodeGamepadLogger = {
            info: (tolog: string) => this.logger.log(tolog),
        };

        this.pad = new NodeGamepad(padConfig, gamepadLogger);

        this.mixer = mixerFactory.get(config.videoMixer.connection);

        this.pad.on('left:move', (value) => {
            const pan = interpolate(value.x, this.moveInterpolation[0], this.moveInterpolation[1])[0];
            this.mixer?.pan(config.videoMixer.mixBlock, pan);
            const tilt = -interpolate(value.y, this.moveInterpolation[0], this.moveInterpolation[1])[0];
            this.mixer?.tilt(config.videoMixer.mixBlock, tilt);
        });

        this.pad.on('right:move', (value) => {
            this.mixer?.zoom(config.videoMixer.mixBlock, Math.round((-value.y + 127) / 16));
            this.mixer?.focus(config.videoMixer.mixBlock, Math.round((value.x - 127) / 200));
        });

        this.pad.on('dpadLeft:press', () => {
            this.changeConnection(EInputChangeDirection.left);
        });

        this.pad.on('dpadUp:press', () => {
            this.changeConnection(EInputChangeDirection.up);
        });

        this.pad.on('dpadRight:press', () => {
            this.changeConnection(EInputChangeDirection.right);
        });

        this.pad.on('dpadDown:press', () => {
            this.changeConnection(EInputChangeDirection.down);
        });

        this.pad.on('r1:press', () => {
            this.mixer?.cut(config.videoMixer.mixBlock);
        });

        this.pad.on('r2:press', () => {
            this.mixer?.auto(config.videoMixer.mixBlock);
        });

        this.pad.on('l1:press', () => {
            if (this.altKeyState == EAltKeyState.default) {
                this.altKeyState = EAltKeyState.alt;
            }
        });

        this.pad.on('l1:release', () => {
            if (this.altKeyState == EAltKeyState.alt) {
                this.altKeyState = EAltKeyState.default;
            }
        });

        this.pad.on('l2:press', () => {
            if (this.altKeyState == EAltKeyState.default) {
                this.altKeyState = EAltKeyState.altLower;
            }
        });

        this.pad.on('l2:release', () => {
            if (this.altKeyState == EAltKeyState.altLower) {
                this.altKeyState = EAltKeyState.default;
            }
        });

        this.pad.on('1:press', () => {
            this.specialFunction(ERumblepadSpecialFunctionKey._1);
        });

        this.pad.on('2:press', () => {
            this.specialFunction(ERumblepadSpecialFunctionKey._2);
        });

        this.pad.on('3:press', () => {
            this.specialFunction(ERumblepadSpecialFunctionKey._3);
        });

        this.pad.on('4:press', () => {
            this.specialFunction(ERumblepadSpecialFunctionKey._4);
        });

        this.pad.start();
    }

    subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }
    unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    dispose(): Promise<void> {
        this.pad.stop();
        return Promise.resolve();
    }

    private changeConnection(direction: EInputChangeDirection): void {
        let nextInput = this.config.connectionChange.default[direction];
        switch (this.altKeyState) {
            case EAltKeyState.alt:
                if (this.config.connectionChange.alt) {
                    nextInput = this.config.connectionChange.alt[direction];
                }
                break;
            case EAltKeyState.altLower:
                if (this.config.connectionChange.altLower) {
                    nextInput = this.config.connectionChange.altLower[direction];
                }
                break;
            default:
                break;
        }

        if (nextInput) {
            this.mixer?.changeInput(this.config.videoMixer.mixBlock, nextInput);
        }
    }

    private specialFunction(key: ERumblepadSpecialFunctionKey): void {
        let specialFunction = this.config.specialFunction.default[key];
        switch (this.altKeyState) {
            case EAltKeyState.alt:
                if (this.config.specialFunction.alt) {
                    specialFunction = this.config.specialFunction.alt[key];
                }
                break;
            case EAltKeyState.altLower:
                if (this.config.specialFunction.altLower) {
                    specialFunction = this.config.specialFunction.altLower[key];
                }
                break;
            default:
                break;
        }

        if (specialFunction) {
            switch (specialFunction.type) {
                case ESpecialFunctionType.key:
                    this.mixer?.toggleKey(this.config.videoMixer.mixBlock, specialFunction.index);
                    break;
                case ESpecialFunctionType.macro:
                    this.mixer?.runMacro(specialFunction.index);
                    break;
            }
        }
    }
}
