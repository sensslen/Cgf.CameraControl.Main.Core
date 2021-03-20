import { Atem as AtemConnection, AtemState } from 'atem-connection';
import { StrictEventEmitter } from 'strict-event-emitter-types';
import { CameraConnectionFactory } from '../../CameraConnection/CameraConnectionFactory';
import { ICameraConnection } from '../../CameraConnection/ICameraConnection';
import { IConnection } from '../../GenericFactory/IConnection';
import { ILogger } from '../../Logger/ILogger';
import { IVideoMixer } from '../IVideoMixer';
import { IAtemConfig } from './IAtemConfig';
import { EventEmitter } from 'events';
import { IImageSelectionChange } from '../IImageSelectionChange';

export class Atem implements IVideoMixer {
    private readonly _cameraConnections: { [key: number]: ICameraConnection } = {};
    private readonly atem: AtemConnection;
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();
    private readonly _imageSelectionEmitters: {
        [key: number]: StrictEventEmitter<EventEmitter, IImageSelectionChange>;
    } = {};
    private readonly _selectedCamera: {
        [key: number]: ICameraConnection;
    } = {};

    constructor(private config: IAtemConfig, private logger: ILogger, camConnectionFactory: CameraConnectionFactory) {
        for (let key in config.CameraConnections) {
            if (config.CameraConnections.hasOwnProperty(key)) {
                const index = config.CameraConnections[key];
                let cam = camConnectionFactory.get(index);
                if (cam) {
                    this._cameraConnections[key] = cam;
                } else {
                    this.LogError(`Failed to get camera with index:${index}`);
                }
            }
        }

        this.atem = new AtemConnection({ disableMultithreaded: config.disableMultithreading });

        this.atem.on('info', (toLog) => this.Log(toLog));
        this.atem.on('error', (toLog) => this.LogError(toLog));

        this.atem.connect(config.IP);

        this.atem.on('connected', () => {
            this._connectionEmitter.emit('change', true);
            if (this.atem.state) {
                this.stateChange(this.atem.state);
            }
        });

        this.atem.on('disconnected', () => {
            this._connectionEmitter.emit('change', false);
        });

        this.atem.on('stateChanged', (state, _pathToChange) => {
            this.stateChange(state);
        });
    }

    imageSelectionChangeGet(me: number): StrictEventEmitter<EventEmitter, IImageSelectionChange> {
        if (!this._imageSelectionEmitters[me]) {
            this._imageSelectionEmitters[me] = new EventEmitter();
        }
        return this._imageSelectionEmitters[me];
    }

    public get connectionString(): string {
        return this.config.IP;
    }

    private _connected = false;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
    }

    pan(meNumber: number, value: number): void {
        let cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.pan(value);
        }
    }
    tilt(meNumber: number, value: number): void {
        let cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.tilt(value);
        }
    }
    zoom(meNumber: number, value: number): void {
        let cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.zoom(value);
        }
    }
    focus(meNumber: number, value: number): void {
        let cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.focus(value);
        }
    }
    cut(meNumber: number): void {
        this.atem.cut(meNumber);
    }
    auto(meNumber: number): void {
        this.atem.autoTransition(meNumber);
    }
    changeInput(meNumber: number, newInput: number): void {
        this.atem.changePreviewInput(newInput, meNumber);
    }
    toggleKey(meNumber: number, key: number): void {
        if (this.atem.state !== undefined) {
            const meState = this.atem.state.video.mixEffects[meNumber];
            if (meState !== undefined) {
                const keyState = meState.upstreamKeyers[key];
                if (keyState !== undefined) {
                    this.atem.setUpstreamKeyerOnAir(!keyState.onAir, meNumber, key);
                }
            }
        }
    }
    runMacro(macro: number): void {
        this.atem.macroRun(macro);
    }

    subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }
    unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    async dispose(): Promise<void> {
        this.connected = false;
        await this.atem.disconnect();
    }

    private stateChange(state: AtemState): void {
        state.video.mixEffects.forEach((state, index) => {
            if (state !== undefined) {
                this.updatePreview(index, state);
                this.updateCameraSelection(index, state);
            }
        });
    }

    private updatePreview(index: number, state: MixEffect) {
        const emitter = this._imageSelectionEmitters[index];
        const onAirInputs = this.atem.listVisibleInputs('program');
        const newPreviewIsOnAir = onAirInputs.some((input) => input === state.previewInput);
        emitter?.emit('previewChange', state.previewInput, newPreviewIsOnAir);
    }

    private updateCameraSelection(index: number, state: MixEffect) {
        this._selectedCamera[index] = this._cameraConnections[state.previewInput];
    }

    private LogError(toLog: string) {
        this.logger.error(`Atem: ${toLog}`);
    }

    private Log(toLog: string) {
        this.logger.log(`Atem: ${toLog}`);
    }
}
