import { Observable } from 'rxjs';

export interface IConnectionProvider {
    readonly whenConnectionChanged: Observable<boolean>;
}
