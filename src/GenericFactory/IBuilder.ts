import { IConfig } from '../Configuration/IConfig';

export interface IBuilder<TConcrete> {
    Type: string;
    build(config: IConfig): TConcrete | undefined;
}
