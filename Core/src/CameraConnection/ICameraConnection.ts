import { IConnectionProvider } from '../GenericFactory/IConnectionProvider';
import { IDisposable } from '../GenericFactory/IDisposable';

export interface ICameraConnection extends IDisposable, IConnectionProvider {
    readonly connectionString: string;

    /**
     * Set the pan speed of the camera.
     * @param value The speed of pan in the value range of [-1 .. 1] where
     * -1 represents maximum speed left and 1 represents maximum speed right
     */
    pan(value: number): void;
    /**
     * Set the tilt speed of the camera.
     * @param value The speed of tilt in the value range of [-1 .. 1] where
     * -1 represents maximum speed down and 1 represents maximum speed up
     */
    tilt(value: number): void;
    /**
     * Set the zoom speed of the camera.
     * @param value The speed of zoom in the value range of [-1 .. 1] where
     * -1 represents maximum speed out and 1 represents maximum speed in
     */
    zoom(value: number): void;
    /**
     * Set the focus speed of the camera.
     * @param value The speed of zoom in the value range of [-1 .. 1] where
     * -1 represents maximum speed out and 1 represents maximum speed in
     */
    focus(value: number): void;

    /**
     * Tell the camera the current tally state.
     */
    tallyState(value: 'off' | 'preview' | 'program'): void;
}
