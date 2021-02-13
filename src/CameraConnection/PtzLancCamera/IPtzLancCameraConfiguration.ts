import { IConfig } from '../../Configuration/IConfig';

export interface IPtzLancCameraConfiguration extends IConfig {
    ConnectionUrl: string;
    ConnectionPort: string;
}
