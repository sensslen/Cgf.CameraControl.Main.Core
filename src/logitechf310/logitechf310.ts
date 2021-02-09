import { NodeGamepad, IConfig } from '@sensslen/node-gamepad';
import { ILogger as NodeGamepadLogger } from '@sensslen/node-gamepad';
import { IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConnection } from 'cgf.cameracontrol.main.core';
import {
    eInputChangeDirection,
    eSpecialFunctionKey,
    eSpecialFunctionType,
    Ilogitechf310Config,
} from './Ilogitechf310Config';
import * as gamepadConfig from '@sensslen/node-gamepad/controllers/logitech/gamepadf310.json';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { EventEmitter } from 'events';
import { IVideoMixer } from 'cgf.cameracontrol.main.core/dist/VideoMixer/IVideoMixer';
const interpolate = require('everpolate').linear;

enum eAltKeyState {
    default,
    alt,
    altLower,
}

export class logitechf310 implements IHmi {
    private readonly pad: NodeGamepad;
    private readonly moveInterpolation: number[][] = [
        [0, 63, 31, 127, 128, 160, 172, 255],
        [255, 70, 20, 0, 0, -20, -70, -255],
    ];
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();
    private altKeyState = eAltKeyState.default;
    private readonly mixer?: IVideoMixer;

    constructor(private config: Ilogitechf310Config, private logger: ILogger, mixerFactory: VideomixerFactory) {
        let padConfig = gamepadConfig as IConfig;
        if (config.SerialNumber) {
            padConfig.serialNumber = config.SerialNumber;
        }

        const gamepadLogger: NodeGamepadLogger = {
            Log: (tolog: string) => this.logger.log(tolog),
        };

        this.pad = new NodeGamepad(padConfig, gamepadLogger);

        this.mixer = mixerFactory.get(config.VideoMixer.Connection);

        this.pad.on('left:move', (value) => {
            const pan = interpolate(value.x, this.moveInterpolation[0], this.moveInterpolation[1])[0];
            this.mixer?.pan(config.VideoMixer.MixBlock, pan);
            const tilt = -interpolate(value.y, this.moveInterpolation[0], this.moveInterpolation[1])[0];
            this.mixer?.tilt(config.VideoMixer.MixBlock, tilt);
        });

        this.pad.on('right:move', (value) => {
            this.mixer?.zoom(config.VideoMixer.MixBlock, Math.round((-value.y + 127) / 16));
            this.mixer?.focus(config.VideoMixer.MixBlock, Math.round((value.x - 127) / 200));
        });

        this.pad.on('dpadLeft:press', () => {
            this.changeConnection(eInputChangeDirection.left);
        });

        this.pad.on('dpadUp:press', () => {
            this.changeConnection(eInputChangeDirection.up);
        });

        this.pad.on('dpadRight:press', () => {
            this.changeConnection(eInputChangeDirection.right);
        });

        this.pad.on('dpadDown:press', () => {
            this.changeConnection(eInputChangeDirection.down);
        });

        this.pad.on('RB:press', () => {
            this.mixer?.cut(config.VideoMixer.MixBlock);
        });

        this.pad.on('RT:press', () => {
            this.mixer?.auto(config.VideoMixer.MixBlock);
        });

        this.pad.on('LB:press', () => {
            if (this.altKeyState == eAltKeyState.default) {
                this.altKeyState = eAltKeyState.alt;
            }
        });

        this.pad.on('LB:release', () => {
            if (this.altKeyState == eAltKeyState.alt) {
                this.altKeyState = eAltKeyState.default;
            }
        });

        this.pad.on('LT:press', () => {
            if (this.altKeyState == eAltKeyState.default) {
                this.altKeyState = eAltKeyState.altLower;
            }
        });

        this.pad.on('LT:release', () => {
            if (this.altKeyState == eAltKeyState.altLower) {
                this.altKeyState = eAltKeyState.default;
            }
        });

        this.pad.on('A:press', () => {
            this.specialFunction(eSpecialFunctionKey.a);
        });

        this.pad.on('B:press', () => {
            this.specialFunction(eSpecialFunctionKey.b);
        });

        this.pad.on('X:press', () => {
            this.specialFunction(eSpecialFunctionKey.x);
        });

        this.pad.on('Y:press', () => {
            this.specialFunction(eSpecialFunctionKey.y);
        });

        this.pad.start();
    }

    private _connected = false;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
    }

    subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }
    unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    dispose(): void {
        this.pad.stop();
    }

    private changeConnection(direction: eInputChangeDirection): void {
        let nextInput = this.config.ConnectionChange.Default[direction];
        switch (this.altKeyState) {
            case eAltKeyState.alt:
                if (this.config.ConnectionChange.Alt) {
                    nextInput = this.config.ConnectionChange.Alt[direction];
                }
                break;
            case eAltKeyState.altLower:
                if (this.config.ConnectionChange.AltLower) {
                    nextInput = this.config.ConnectionChange.AltLower[direction];
                }
                break;
            default:
                break;
        }

        if (nextInput) {
            this.mixer?.changeInput(this.config.VideoMixer.MixBlock, nextInput);
        }
    }

    private specialFunction(key: eSpecialFunctionKey): void {
        let specialFunction = this.config.SpecialFunction.Default[key];
        switch (this.altKeyState) {
            case eAltKeyState.alt:
                if (this.config.SpecialFunction.Alt) {
                    specialFunction = this.config.SpecialFunction.Alt[key];
                }
                break;
            case eAltKeyState.altLower:
                if (this.config.SpecialFunction.AltLower) {
                    specialFunction = this.config.SpecialFunction.AltLower[key];
                }
                break;
            default:
                break;
        }

        if (specialFunction) {
            switch (specialFunction.type) {
                case eSpecialFunctionType.key:
                    this.mixer?.toggleKey(this.config.VideoMixer.MixBlock, specialFunction.index);
                    break;
                case eSpecialFunctionType.macro:
                    this.mixer?.runMacro(specialFunction.index);
                    break;
            }
        }
    }
}
