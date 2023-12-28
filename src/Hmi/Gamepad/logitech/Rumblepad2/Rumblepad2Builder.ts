import * as ConfigSchema from './IRumblepad2Config.json';

import {
    CameraConnectionFactory,
    IBuilder,
    IConfig,
    IHmi,
    ILogger,
    VideomixerFactory,
} from 'cgf.cameracontrol.main.core';
import { ConfigValidator } from '../../../../ConfigValidator';
import { IRumblepad2Config } from './IRumblepad2Config';
import { Rumblepad2 } from './Rumblepad2';

export class Rumblepad2Builder implements IBuilder<IHmi> {
    constructor(
        private logger: ILogger,
        private mixerFactory: VideomixerFactory,
        private cameraFactory: CameraConnectionFactory
    ) {}
    supportedTypes(): Promise<string[]> {
        return Promise.resolve(['logitech/Rumblepad2']);
    }

    build(config: IConfig): Promise<IHmi> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IRumblepad2Config>(config, ConfigSchema);

        if (validConfig === undefined) {
            return Promise.reject(configValidator.errorGet());
        }

        return Promise.resolve(new Rumblepad2(validConfig, this.logger, this.mixerFactory, this.cameraFactory));
    }
}
