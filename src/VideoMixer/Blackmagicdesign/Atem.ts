import { Atem as AtemConnection, AtemState } from 'atem-connection';

import { CameraConnectionFactory } from '../../CameraConnection/CameraConnectionFactory';
import { EventEmitter } from 'events';
import { IAtemConfig } from './IAtemConfig';
import { ICameraConnection } from '../../CameraConnection/ICameraConnection';
import { IConnection } from '../../GenericFactory/IConnection';
import { IImageSelectionChange } from '../IImageSelectionChange';
import { ILogger } from '../../Logger/ILogger';
import { IVideoMixer } from '../IVideoMixer';
import { MixEffect } from 'atem-connection/dist/state/video';
import { StrictEventEmitter } from 'strict-event-emitter-types';

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

    public get connectionString(): string {
        return this.config.ip;
    }

    private _connected = false;
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connectionEmitter.emit('change', v);
        this._connected = v;
    }

    constructor(private config: IAtemConfig, private logger: ILogger, camConnectionFactory: CameraConnectionFactory) {
        for (const key in config.cameraConnections) {
            if (Object.prototype.hasOwnProperty.call(config.cameraConnections, key)) {
                const index = config.cameraConnections[key];
                const cam = camConnectionFactory.get(index);
                if (cam) {
                    this._cameraConnections[key] = cam;
                } else {
                    this.logError(`Failed to get camera with index:${index}`);
                }
            }
        }

        this.atem = new AtemConnection();

        this.atem.on('info', (toLog) => this.log(toLog));
        this.atem.on('error', (toLog) => this.logError(toLog));

        this.atem.connect(config.ip);

        this.atem.on('connected', () => {
            this.connected = true;
            if (this.atem.state) {
                this.stateChange(this.atem.state);
            }
        });

        this.atem.on('disconnected', () => {
            this.connected = false;
        });

        this.atem.on('stateChanged', (state, _pathToChange) => {
            this.stateChange(state);
        });
    }

    public imageSelectionChangeGet(me: number): StrictEventEmitter<EventEmitter, IImageSelectionChange> {
        if (!this._imageSelectionEmitters[me]) {
            this._imageSelectionEmitters[me] = new EventEmitter();
        }
        return this._imageSelectionEmitters[me];
    }

    public pan(meNumber: number, value: number): void {
        const cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.pan(value);
        }
    }
    public tilt(meNumber: number, value: number): void {
        const cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.tilt(value);
        }
    }
    public zoom(meNumber: number, value: number): void {
        const cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.zoom(value);
        }
    }
    public focus(meNumber: number, value: number): void {
        const cam = this._selectedCamera[meNumber];
        if (cam) {
            cam.focus(value);
        }
    }
    public cut(meNumber: number): void {
        if (this.connected) {
            this.atem.cut(meNumber);
        }
    }
    public auto(meNumber: number): void {
        if (this.connected) {
            this.atem.autoTransition(meNumber);
        }
    }
    public changeInput(meNumber: number, newInput: number): void {
        if (this.connected) {
            this.atem.changePreviewInput(newInput, meNumber);
        }
    }
    public toggleKey(meNumber: number, key: number): void {
        if (this.connected && this.atem.state !== undefined) {
            const meState = this.atem.state.video.mixEffects[meNumber];
            if (meState !== undefined) {
                const keyState = meState.upstreamKeyers[key];
                if (keyState !== undefined) {
                    this.atem.setUpstreamKeyerOnAir(!keyState.onAir, meNumber, key);
                }
            }
        }
    }
    public runMacro(macro: number): void {
        if (this.connected) {
            this.atem.macroRun(macro);
        }
    }

    public subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }
    public unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    async dispose(): Promise<void> {
        try {
            await this.atem.disconnect();
            this.connected = false;
        } catch (error) {
            this.logError(`Failed to disconnect from mixer - ${error}`);
        }
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

    private logError(toLog: string) {
        this.logger.error(`Atem: ${toLog}`);
    }

    private log(toLog: string) {
        this.logger.log(`Atem: ${toLog}`);
    }
}
