import { IConfig } from '../../Configuration/IConfig';
import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IBuilder } from '../../GenericFactory/IBuilder';
import { ICameraConnection } from '../ICameraConnection';
import { PtzLancCamera } from './PtzLancCamera';
import { IPtzLancCameraConfiguration } from './IPtzLancCameraConfiguration';
import * as ConfigSchema from './IPtzLancCameraConfiguration.json';
import { ILogger } from '../../Logger/ILogger';

export class PtzLancCameraBuilder implements IBuilder<ICameraConnection> {
    constructor(private logger: ILogger) {}

    Types = ['PtzLancCamera'];

    build(config: IConfig): ICameraConnection | undefined {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<IPtzLancCameraConfiguration>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        return new PtzLancCamera(validConfig, this.logger);
    }

    private error(error: string): void {
        this.logger.error(`PtzLancCameraBuilder: ${error}`);
    }
}
