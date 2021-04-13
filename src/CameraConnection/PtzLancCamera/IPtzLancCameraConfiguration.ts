import { IConfig } from '../../Configuration/IConfig';

export interface IPtzLancCameraConfiguration extends IConfig {
    connectionUrl: string;
    connectionPort: string;
}
