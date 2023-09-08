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
    private readonly _currentConnection: { selectedInput: number; onAir: boolean } = {
        selectedInput: -1,
        onAir: false,
    };

    constructor(
        private config: IAtemConfig,
        private atemFactory: AtemFactory
    ) {
        this.connection = atemFactory.get(config.ip);

        this.connection.atem.on('stateChanged', (state, _pathToChange) => {
            this.stateChange(state);
        });
    }

    public get connectionString(): string {
        return `${this.config.ip}:${this.config.mixEffectBlock}`;
    }

    public async isKeySet(key: number): Promise<boolean> {
        const atemState = await this.getCurrentSwitcherState();
        return this.isKeySetInState(atemState, key);
    }

    public async getAuxilarySelection(aux: number): Promise<number> {
        const atemState = await this.getCurrentSwitcherState();
        const auxSelection = this.getAuxSelectionInState(atemState, aux);
        if (auxSelection !== undefined) {
            return auxSelection;
        } else {
            throw new Error('could not find proper aux selection');
        }
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
        const meState = state.video.mixEffects[this.config.mixEffectBlock];
        if (meState !== undefined) {
            this.updatePreview(meState);
        }
    }

    private updatePreview(state: MixEffect) {
        const onAirInputs = this.connection.atem.listVisibleInputs('program');
        const newPreviewIsOnAir = onAirInputs.some((input) => input === state.previewInput);

        if (
            this._currentConnection.selectedInput === state.previewInput &&
            this._currentConnection.onAir === newPreviewIsOnAir
        ) {
            return;
        }
        this._selectedChangeEmitter.emit('previewChange', state.previewInput, newPreviewIsOnAir);

        this._currentConnection.selectedInput = state.previewInput;
        this._currentConnection.onAir = newPreviewIsOnAir;
    }

    private isKeySetInState(state: AtemState, key: number): boolean {
        const meState = state.video.mixEffects[this.config.mixEffectBlock];
        if (meState !== undefined) {
            const keyState = meState.upstreamKeyers[key];
            if (keyState !== undefined) {
                return keyState.onAir;
            }
        }
        return false;
    }

    private getAuxSelectionInState(state: AtemState, aux: number): number | undefined {
        return state.video.auxilliaries[aux];
    }

    private getCurrentSwitcherState(): Promise<AtemState> {
        return new Promise((resolve, reject) => {
            if (this.connection.connection === undefined) {
                reject('no connection');
            }
            if (this.connection.atem.state !== undefined) {
                resolve(this.connection.atem.state);
            } else {
                this.connection.atem.once('stateChanged', (state, _pathToChange) => {
                    resolve(state);
                });
            }
        });
    }
}
