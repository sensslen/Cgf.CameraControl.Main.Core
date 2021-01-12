import { ILogger } from '../../Logger/ILogger';
import { ICameraConnection } from '../ICameraConnection';
import { IPtzLancCameraConfiguration } from './IPtzLancCameraConfiguration';

export class PtzLancCamera implements ICameraConnection {
    constructor(private config: IPtzLancCameraConfiguration, private logger: ILogger) {
        this.config = this.config;
        this.logger = this.logger;
    }

    pan(value: number): void {
        value = value;
        throw new Error('Method not implemented.');
    }
    tilt(value: number): void {
        value = value;
        throw new Error('Method not implemented.');
    }
    zoom(value: number): void {
        value = value;
        throw new Error('Method not implemented.');
    }
    focus(value: number): void {
        value = value;
        throw new Error('Method not implemented.');
    }
}
