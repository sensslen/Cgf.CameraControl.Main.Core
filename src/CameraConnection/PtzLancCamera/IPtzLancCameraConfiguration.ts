import { IConfig } from '../../GenericFactory/IConfig';

export interface IPtzLancCameraConfiguration extends IConfig {
    ConnectionUrl: string;
    ConnectionPort: string;
}
