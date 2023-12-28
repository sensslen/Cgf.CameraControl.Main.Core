import { IConfig } from '../Configuration/IConfig';

export interface IConfigurationStructure {
    cams: IConfig[];
    videoMixers: IConfig[];
    interfaces: IConfig[];
}
