import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';

import { IConnection } from '../GenericFactory/IConnection';
import { IDisposable } from '../GenericFactory/IDisposable';
import { ISubscription } from '../GenericFactory/ISubscription';
import { IImageSelectionChange } from './IImageSelectionChange';

export interface IVideoMixer extends ISubscription<IConnection>, IDisposable {
    imageSelectionChangeGet(meNumber: number): StrictEventEmitter<EventEmitter, IImageSelectionChange>;
    pan(meNumber: number, value: number): void;
    tilt(meNumber: number, value: number): void;
    zoom(meNumber: number, value: number): void;
    focus(meNumber: number, value: number): void;

    cut(meNumber: number): void;
    auto(meNumber: number): void;
    changeInput(meNumber: number, newInput: number): void;
    toggleKey(meNumber: number, key: number): void;
    runMacro(macro: number): void;

    connectionString: string;
}
