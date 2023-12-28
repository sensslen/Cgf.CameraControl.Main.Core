import { IConnection } from '../GenericFactory/IConnection';
import { IDisposable } from '../GenericFactory/IDisposable';
import { ISubscription } from '../GenericFactory/ISubscription';

export interface IHmi extends ISubscription<IConnection>, IDisposable {}
