import { IConfig } from '../../Configuration/IConfig';

export interface IAtemConfig extends IConfig {
    ip: string;
    cameraConnections: { [key: number]: number };
}
