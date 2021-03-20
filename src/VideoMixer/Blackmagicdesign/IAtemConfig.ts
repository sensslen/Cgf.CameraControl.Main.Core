import { IConfig } from '../../Configuration/IConfig';

export interface IAtemConfig extends IConfig {
    IP: string;
    CameraConnections: { [key: number]: number };
    disableMultithreading?: boolean;
}
