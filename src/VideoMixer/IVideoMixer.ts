import { EventEmitter } from 'events';
import { IConnection } from '../GenericFactory/IConnection';
import { IDisposable } from '../GenericFactory/IDisposable';
import { IImageSelectionChange } from './IImageSelectionChange';
import { IMacroRun } from './IMacroRun';
import { ISubscription } from '../GenericFactory/ISubscription';
import StrictEventEmitter from 'strict-event-emitter-types';

export interface IVideoMixer extends ISubscription<IConnection>, IDisposable {
    connectionString: string;

    /**
     * Get the event emitter that allows to register for image selection changes
     */
    imageSelectionChangeGet(): StrictEventEmitter<EventEmitter, IImageSelectionChange>;
    /**
     * Get the event emitter that allows to register for a macro run event.
     * This event might also be fired if a macro is run on a different MixEffectBlock
     * on the same device
     */
    macroRunEmitterGet(): StrictEventEmitter<EventEmitter, IMacroRun>;

    cut(): void;
    auto(): void;
    changeInput(newInput: number): void;
    toggleKey(key: number): void;
    runMacro(macro: number): void;
}
