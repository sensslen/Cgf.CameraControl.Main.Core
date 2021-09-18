import {
    CameraConnectionFactory,
    ICameraConnection,
    IConnection,
    IHmi,
    ILogger,
    IVideoMixer,
    VideomixerFactory,
} from 'cgf.cameracontrol.main.core';
import { EButtonDirection, IGamepadConfiguration } from './IGamepadConfiguration';

import { EventEmitter } from 'events';
import { ISpecialFunction } from './SpecialFunctions/ISpecialFunction';
import { ISpecialFunctionDefinition } from './SpecialFunctions/ISpecialFunctionDefinition';
import { SpecialFunctionFactory } from './SpecialFunctions/SpecialFunctionFactory';
import { StrictEventEmitter } from 'strict-event-emitter-types';

enum EAltKey {
    none,
    alt,
    altLower,
}

export abstract class Gamepad implements IHmi {
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();
    private altKeyState = EAltKey.none;
    private readonly mixer?: IVideoMixer;
    private readonly cameras: { [key: number]: ICameraConnection } = {};
    private selectedCamera?: ICameraConnection;
    private readonly connectionChange: {
        default: { [key in EButtonDirection]?: number };
        alt?: { [key in EButtonDirection]?: number };
        altLower?: { [key in EButtonDirection]?: number };
    };

    private readonly specialFunctionDefault: { [key in EButtonDirection]?: ISpecialFunction } = {};
    private readonly specialFunctionAlt: { [key in EButtonDirection]?: ISpecialFunction } = {};
    private readonly specialFunctionAltLower: { [key in EButtonDirection]?: ISpecialFunction } = {};
    private _connected = false;

    constructor(
        config: IGamepadConfiguration,
        private logger: ILogger,
        mixerFactory: VideomixerFactory,
        cameraConnectionFactory: CameraConnectionFactory
    ) {
        this.mixer = mixerFactory.get(config.videoMixer);

        for (const key in config.cameraMap) {
            const camera = cameraConnectionFactory.get(config.cameraMap[key]);
            if (camera !== undefined) {
                this.cameras[key] = camera;
            }
        }

        this.connectionChange = config.connectionChange;

        this.parseSpecialFunctionConfig(config.specialFunction.default, (key, config) => {
            this.specialFunctionDefault[key] = SpecialFunctionFactory.get(config);
        });

        if (config.specialFunction.alt) {
            this.parseSpecialFunctionConfig(config.specialFunction.alt, (key, config) => {
                this.specialFunctionAlt[key] = SpecialFunctionFactory.get(config);
            });
        }

        if (config.specialFunction.altLower) {
            this.parseSpecialFunctionConfig(config.specialFunction.altLower, (key, config) => {
                this.specialFunctionAltLower[key] = SpecialFunctionFactory.get(config);
            });
        }

        this.mixer
            ?.imageSelectionChangeGet()
            .on('previewChange', (preview: number, onAir: boolean) => this.mixerPreviewChange(preview, onAir));
    }

    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
    }

    public subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }
    public unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    protected changeConnection(direction: EButtonDirection): void {
        let nextInput = this.connectionChange.default[direction];
        switch (this.altKeyState) {
            case EAltKey.alt:
                if (this.connectionChange.alt) {
                    nextInput = this.connectionChange.alt[direction];
                }
                break;
            case EAltKey.altLower:
                if (this.connectionChange.altLower) {
                    nextInput = this.connectionChange.altLower[direction];
                }
                break;
            default:
                break;
        }

        if (nextInput) {
            this.mixer?.changeInput(nextInput);
        }
    }

    protected specialFunction(key: EButtonDirection): void {
        if (this.mixer === undefined) {
            return;
        }

        let specialFunction = this.specialFunctionDefault[key];
        switch (this.altKeyState) {
            case EAltKey.alt: {
                const altVariant = this.specialFunctionAlt[key];
                if (altVariant) {
                    specialFunction = altVariant;
                }
                break;
            }
            case EAltKey.altLower: {
                const altLowerVariant = this.specialFunctionAltLower[key];
                if (altLowerVariant) {
                    specialFunction = altLowerVariant;
                }
                break;
            }
            default:
                break;
        }

        if (specialFunction) {
            specialFunction.run(this.mixer);
        }
    }

    protected pan(value: number): void {
        this.selectedCamera?.pan(value);
    }

    protected tilt(value: number): void {
        this.selectedCamera?.tilt(value);
    }

    protected zoom(value: number): void {
        this.selectedCamera?.zoom(value);
    }

    protected focus(value: number): void {
        this.selectedCamera?.focus(value);
    }

    protected cut(): void {
        this.mixer?.cut();
    }

    protected auto(): void {
        this.mixer?.auto();
    }

    protected altKey(press: boolean): void {
        if (press && this.altKeyState == EAltKey.none) {
            this.altKeyState = EAltKey.alt;
        } else if (!press && this.altKeyState == EAltKey.alt) {
            this.altKeyState = EAltKey.none;
        }
    }

    protected altLowerKey(press: boolean): void {
        if (press && this.altKeyState == EAltKey.none) {
            this.altKeyState = EAltKey.altLower;
        } else if (!press && this.altKeyState == EAltKey.altLower) {
            this.altKeyState = EAltKey.none;
        }
    }

    protected log(toLog: string): void {
        this.logger.log(`Gamepad:${toLog}`);
    }

    protected logError(toLog: string): void {
        this.logger.error(`Gamepad:${toLog}`);
    }

    private mixerPreviewChange(preview: number, onAir: boolean): void {
        const selectedCamera = this.cameras[preview];
        if (selectedCamera !== this.selectedCamera) {
            this.zoom(0);
            this.focus(0);
            this.pan(0);
            this.tilt(0);
        }

        this.selectedCamera = selectedCamera;
        if (selectedCamera !== undefined) {
            this.printConnectionMessage(preview, selectedCamera.connectionString, onAir);
        } else {
            this.printConnectionMessage(preview, 'not a camera', onAir);
        }
    }

    private printConnectionMessage(index: number, connection: string, onAir: boolean) {
        this.log(`Selected input:${index} (${connection})${this.getOnAirMessage(onAir)}`);
    }

    private getOnAirMessage(onAir: boolean): string {
        return onAir ? ' - OnAir' : '';
    }

    private parseSpecialFunctionConfig(
        config: { [key in EButtonDirection]?: ISpecialFunctionDefinition },
        run: (key: EButtonDirection, config: ISpecialFunctionDefinition) => void
    ) {
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const specialFunctionConfig = config[key as EButtonDirection];
                if (specialFunctionConfig !== undefined) {
                    run(key as EButtonDirection, specialFunctionConfig);
                }
            }
        }
    }

    abstract dispose(): Promise<void>;
}
