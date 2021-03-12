import { IConfig } from '../Configuration/IConfig';

export interface IBuilder<TConcrete> {
    readonly Types: string[];
    build(config: IConfig): TConcrete | undefined;
}
