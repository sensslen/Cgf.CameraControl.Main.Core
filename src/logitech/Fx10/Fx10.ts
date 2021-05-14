import { IConnection, IHmi, ILogger, IVideoMixer, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConfig as IGamepadConfig, NodeGamepad, ILogger as NodeGamepadLogger } from '@sensslen/node-gamepad';

import { EFx10SpecialFunctionKey } from './EFx10SpecialFunctionKey';
import { EInputChangeDirection } from '../../ConfigurationHelper/EInputChangeDirection';
import { ESpecialFunctionType } from '../../ConfigurationHelper/ESpecialFunctionType';
import { EventEmitter } from 'events';
import { ILogitechFx10Config } from './ILogitechFx10Config';
import { StrictEventEmitter } from 'strict-event-emitter-types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const interpolate = require('everpolate').linear;

enum EAltKeyState {
    default,
    alt,
    altLower,
}

export class Fx10 implements IHmi {
    private readonly pad: NodeGamepad;
    private readonly moveInterpolation: number[][] = [
        [0, 63, 31, 127, 128, 160, 172, 255],
        [1, 70 / 255, 20 / 255, 0, 0, -20 / 255, -70 / 255, -1],
    ];
    private readonly zoomFocusInterpolation: number[][] = [
        [0, 127, 128, 255],
        [-1, 0, 0, 1],
    ];
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();
    private altKeyState = EAltKeyState.default;
    private readonly mixer?: IVideoMixer;
    private _connected = false;

    constructor(
        private config: ILogitechFx10Config,
        private logger: ILogger,
        mixerFactory: VideomixerFactory,
        gamepadConfig: IGamepadConfig
    ) {
        if (config.serialNumber) {
            gamepadConfig.serialNumber = config.serialNumber;
        }

        const gamepadLogger: NodeGamepadLogger = {
            info: (tolog: string) => this.logger.log(tolog),
        };

        this.pad = new NodeGamepad(gamepadConfig, gamepadLogger);

        this.mixer = mixerFactory.get(config.videoMixer.connection);

        this.pad.on('left:move', (value) => {
            this.mixer?.pan(
                config.videoMixer.mixBlock,
                interpolate(value.x, this.moveInterpolation[0], this.moveInterpolation[1])[0]
            );
            this.mixer?.tilt(
                config.videoMixer.mixBlock,
                interpolate(value.y, this.moveInterpolation[0], this.moveInterpolation[1])[0]
            );
        });

        this.pad.on('right:move', (value) => {
            this.mixer?.zoom(
                config.videoMixer.mixBlock,
                interpolate(value.x, this.zoomFocusInterpolation[0], this.zoomFocusInterpolation[1])[0]
            );
            this.mixer?.focus(
                config.videoMixer.mixBlock,
                interpolate(value.y, this.zoomFocusInterpolation[0], this.zoomFocusInterpolation[1])[0]
            );
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

        this.pad.on('RB:press', () => {
            this.mixer?.cut(config.videoMixer.mixBlock);
        });

        this.pad.on('RT:press', () => {
            this.mixer?.auto(config.videoMixer.mixBlock);
        });

        this.pad.on('LB:press', () => {
            if (this.altKeyState == EAltKeyState.default) {
                this.altKeyState = EAltKeyState.alt;
            }
        });

        this.pad.on('LB:release', () => {
            if (this.altKeyState == EAltKeyState.alt) {
                this.altKeyState = EAltKeyState.default;
            }
        });

        this.pad.on('LT:press', () => {
            if (this.altKeyState == EAltKeyState.default) {
                this.altKeyState = EAltKeyState.altLower;
            }
        });

        this.pad.on('LT:release', () => {
            if (this.altKeyState == EAltKeyState.altLower) {
                this.altKeyState = EAltKeyState.default;
            }
        });

        this.pad.on('A:press', () => {
            this.specialFunction(EFx10SpecialFunctionKey.a);
        });

        this.pad.on('B:press', () => {
            this.specialFunction(EFx10SpecialFunctionKey.b);
        });

        this.pad.on('X:press', () => {
            this.specialFunction(EFx10SpecialFunctionKey.x);
        });

        this.pad.on('Y:press', () => {
            this.specialFunction(EFx10SpecialFunctionKey.y);
        });

        this.pad.start();
    }

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

    private specialFunction(key: EFx10SpecialFunctionKey): void {
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
