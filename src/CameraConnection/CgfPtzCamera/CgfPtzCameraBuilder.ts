import * as ConfigSchema from './ICgfPtzCameraConfiguration.json';

import { CgfPtzCamera } from './CgfPtzCamera';
import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IBuilder } from '../../GenericFactory/IBuilder';
import { ICameraConnection } from '../ICameraConnection';
import { ICgfPtzCameraConfiguration } from './ICgfPtzCameraConfiguration';
import { IConfig } from '../../Configuration/IConfig';
import { ILogger } from '../../Logger/ILogger';

export class CgfPtzCameraBuilder implements IBuilder<ICameraConnection> {
    constructor(private logger: ILogger) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['Cgf.PtzCamera']);
    }

    public build(config: IConfig): Promise<ICameraConnection> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ICgfPtzCameraConfiguration>(config, ConfigSchema);

        if (validConfig === undefined) {
            return Promise.reject(configValidator.errorGet());
        }

        return Promise.resolve(new CgfPtzCamera(validConfig, this.logger));
    }
}
