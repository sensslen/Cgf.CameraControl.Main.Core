import { IConfig } from '../../Configuration/IConfig';

export interface ICgfPtzCameraConfiguration extends IConfig {
    connectionUrl: string;
    connectionPort: string;
}
