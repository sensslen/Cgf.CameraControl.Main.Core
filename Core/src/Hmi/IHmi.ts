import { IConnectionProvider } from '../GenericFactory/IConnectionProvider';
import { IDisposable } from '../GenericFactory/IDisposable';

export interface IHmi extends IConnectionProvider, IDisposable {}
