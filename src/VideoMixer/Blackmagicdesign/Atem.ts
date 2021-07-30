import { AtemFactory, IAtemConnection } from './AtemFactory';
import { IConnection, IImageSelectionChange, IVideoMixer } from 'cgf.cameracontrol.main.core';

import { AtemState } from 'atem-connection';
import { EventEmitter } from 'events';
import { IAtemConfig } from './IAtemConfig';
import { MixEffect } from 'atem-connection/dist/state/video';
import { StrictEventEmitter } from 'strict-event-emitter-types';

export class Atem implements IVideoMixer {
    private readonly connection: IAtemConnection;
    private readonly _selectedChangeEmitter = new EventEmitter() as StrictEventEmitter<
        EventEmitter,
        IImageSelectionChange
    >;

    public get connectionString(): string {
        return `${this.config.ip}:${this.config.mixEffectBlock}`;
    }

    constructor(private config: IAtemConfig, private atemFactory: AtemFactory) {
        this.connection = atemFactory.get(config.ip);

        this.connection.atem.on('stateChanged', (state, _pathToChange) => {
            this.stateChange(state);
        });
    }

    public startup(): Promise<void> {
        return this.connection.startup();
    }

    public imageSelectionChangeGet(): StrictEventEmitter<EventEmitter, IImageSelectionChange> {
        return this._selectedChangeEmitter;
    }

    public cut(): void {
        if (this.connection.connection) {
            this.connection.atem.cut(this.config.mixEffectBlock);
        }
    }

    public auto(): void {
        if (this.connection.connection) {
            this.connection.atem.autoTransition(this.config.mixEffectBlock);
        }
    }

    public changeInput(newInput: number): void {
        if (this.connection.connection) {
            this.connection.atem.changePreviewInput(newInput, this.config.mixEffectBlock);
        }
    }

    public toggleKey(key: number): void {
        if (this.connection.connection && this.connection.atem.state !== undefined) {
            const meState = this.connection.atem.state.video.mixEffects[this.config.mixEffectBlock];
            if (meState !== undefined) {
                const keyState = meState.upstreamKeyers[key];
                if (keyState !== undefined) {
                    this.connection.atem.setUpstreamKeyerOnAir(!keyState.onAir, key);
                }
            }
        }
    }

    public runMacro(macro: number): void {
        if (this.connection.connection) {
            this.connection.atem.macroRun(macro);
        }
    }

    public subscribe(i: IConnection): void {
        this.connection.connection.subscribe(i);
    }

    public unsubscribe(i: IConnection): void {
        this.connection.connection.unsubscribe(i);
    }

    async dispose(): Promise<void> {
        await this.atemFactory.release(this.config.ip);
    }

    private stateChange(state: AtemState): void {
        state.video.mixEffects.forEach((state, index) => {
            if (state !== undefined) {
                this.updatePreview(index, state);
            }
        });
    }

    private updatePreview(index: number, state: MixEffect) {
        const onAirInputs = this.connection.atem.listVisibleInputs('program');
        const newPreviewIsOnAir = onAirInputs.some((input) => input === state.previewInput);
        this._selectedChangeEmitter.emit('previewChange', state.previewInput, newPreviewIsOnAir);
    }
}
