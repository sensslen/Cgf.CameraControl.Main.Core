import { IConfig } from 'cgf.cameracontrol.main.core';

export interface IAtemConfig extends IConfig {
    ip: string;
    mixEffectBlock: number;
}
