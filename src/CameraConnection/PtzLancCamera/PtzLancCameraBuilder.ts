import * as ConfigSchema from './IPtzLancCameraConfiguration.json';

import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IBuilder } from '../../GenericFactory/IBuilder';
import { ICameraConnection } from '../ICameraConnection';
import { IConfig } from '../../Configuration/IConfig';
import { ILogger } from '../../Logger/ILogger';
import { IPtzLancCameraConfiguration } from './IPtzLancCameraConfiguration';
import { PtzLancCamera } from './PtzLancCamera';

export class PtzLancCameraBuilder implements IBuilder<ICameraConnection> {
    constructor(private logger: ILogger) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['PtzLancCamera']);
    }

    public build(config: IConfig): Promise<ICameraConnection> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IPtzLancCameraConfiguration>(config, ConfigSchema);

        if (validConfig === undefined) {
            return Promise.reject(configValidator.errorGet());
        }

        return Promise.resolve(new PtzLancCamera(validConfig, this.logger));
    }
}
