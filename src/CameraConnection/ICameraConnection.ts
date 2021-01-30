import { IConnection } from '../GenericFactory/IConnection';
import { IDisposable } from '../GenericFactory/IDisposable';
import { ISubscription } from '../GenericFactory/ISubscription';

export interface ICameraConnection extends ISubscription<IConnection>, IDisposable {
    pan(value: number): void;
    tilt(value: number): void;
    zoom(value: number): void;
    focus(value: number): void;

    readonly connectionString: string;
}
