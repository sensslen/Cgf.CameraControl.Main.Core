import { IConfig } from '../../GenericFactory/IConfig';

export interface IAtemConfig extends IConfig {
    IP: string;
    CameraConnections: { [key: number]: number };
}
