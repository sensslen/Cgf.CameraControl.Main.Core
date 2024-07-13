import { Observable } from 'rxjs';

export interface IConnectionProvider {
    readonly whenConnectedChanged: Observable<boolean>;
}
