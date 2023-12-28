import { IConfig } from '../Configuration/IConfig';

export interface IBuilder<TConcrete> {
    supportedTypes(): Promise<string[]>;
    build(config: IConfig): Promise<TConcrete>;
}
