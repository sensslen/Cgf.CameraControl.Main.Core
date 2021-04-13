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
     * @param meNumber the Mix Effect block for which the image change emitter should be received
     */
    imageSelectionChangeGet(meNumber: number): StrictEventEmitter<EventEmitter, IImageSelectionChange>;

    /**
     * Set the pan speed of the camera.
     * @param meNumber The mix event block for which's preselected
     * camera to transmit the pan value
     * @param value The speed of pan in the value range of [-1 .. 1] where
     * -1 represents maximum speed left and 1 represents maximum speed right
     */
    pan(meNumber: number, value: number): void;
    /**
     * Set the tilt speed of the camera.
     * @param meNumber The mix event block for which's preselected
     * camera to transmit the pan value
     * @param value The speed of tilt in the value range of [-1 .. 1] where
     * -1 represents maximum speed down and 1 represents maximum speed up
     */
    tilt(meNumber: number, value: number): void;
    /**
     * Set the zoom speed of the camera.
     * @param meNumber The mix event block for which's preselected
     * camera to transmit the pan value
     * @param value The speed of zoom in the value range of [-1 .. 1] where
     * -1 represents maximum speed out and 1 represents maximum speed in
     */
    zoom(meNumber: number, value: number): void;
    /**
     * Set the focus speed of the camera.
     * @param meNumber The mix event block for which's preselected
     * camera to transmit the pan value
     * @param value The speed of zoom in the value range of [-1 .. 1] where
     * -1 represents maximum speed out and 1 represents maximum speed in
     */
    focus(meNumber: number, value: number): void;

    cut(meNumber: number): void;
    auto(meNumber: number): void;
    changeInput(meNumber: number, newInput: number): void;
    toggleKey(meNumber: number, key: number): void;
    runMacro(macro: number): void;
}
