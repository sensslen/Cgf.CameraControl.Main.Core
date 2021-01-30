import { IConfig } from '../GenericFactory/IConfig';

export interface IConfigurationStructure {
    cams: IConfig[];
    videoMixers: IConfig[];
    interfaces: IConfig[];
}
