import { IConfig } from './IConfig';

export interface IBuilder<TConcrete> {
    Type: string;
    build(config: IConfig): TConcrete | undefined;
}
