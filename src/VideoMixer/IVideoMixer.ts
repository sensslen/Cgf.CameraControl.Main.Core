import { EventEmitter } from 'events';
import { IConnection } from '../GenericFactory/IConnection';
import { IDisposable } from '../GenericFactory/IDisposable';
import { IImageSelectionChange } from './IImageSelectionChange';
import { ISubscription } from '../GenericFactory/ISubscription';
import StrictEventEmitter from 'strict-event-emitter-types';

export interface IVideoMixer extends ISubscription<IConnection>, IDisposable {
    connectionString: string;

    /**
     * Get the event emitter that allows to register for image selection changes
     */
    imageSelectionChangeGet(): StrictEventEmitter<EventEmitter, IImageSelectionChange>;

    cut(): void;
    auto(): void;
    changeInput(newInput: number): void;
    toggleKey(key: number): void;
    runMacro(macro: number): void;

    /**
     * This function allows to get whether the key is set or not
     * @param key The key which's state is requested
     */
    isKeySet(key: number): Promise<boolean>;

    /**
     * Get the current selected output for the given auxilary output
     * @param aux The aux output which's selected source is of interest
     */
    getAuxilarySelection(aux: number): Promise<number>;
}
