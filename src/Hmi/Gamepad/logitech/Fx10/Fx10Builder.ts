import * as ConfigSchema from './ILogitechFx10Config.json';
import * as f310Config from '@sensslen/node-gamepad/controllers/logitech/gamepadf310.json';
import * as f710Config from '@sensslen/node-gamepad/controllers/logitech/gamepadf710.json';

import {
    CameraConnectionFactory,
    IBuilder,
    IConfig,
    IHmi,
    ILogger,
    VideomixerFactory,
} from 'cgf.cameracontrol.main.core';
import { ConfigValidator } from '../../../../ConfigValidator';
import { Fx10 } from './Fx10';
import { ILogitechFx10Config } from './ILogitechFx10Config';

export class Fx10Builder implements IBuilder<IHmi> {
    private readonly f310Name = 'logitech/F310';
    private readonly f710Name = 'logitech/F710';

    constructor(
        private logger: ILogger,
        private mixerFactory: VideomixerFactory,
        private cameraFactory: CameraConnectionFactory
    ) {}

    public supportedTypes(): Promise<string[]> {
        return Promise.resolve([this.f310Name, this.f710Name]);
    }

    build(config: IConfig): Promise<IHmi> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ILogitechFx10Config>(config, ConfigSchema);

        if (validConfig === undefined) {
            return Promise.reject(configValidator.errorGet());
        }

        switch (config.type) {
            case this.f310Name:
                return Promise.resolve(
                    new Fx10(validConfig, this.logger, this.mixerFactory, this.cameraFactory, f310Config)
                );
            case this.f710Name:
                return Promise.resolve(
                    new Fx10(validConfig, this.logger, this.mixerFactory, this.cameraFactory, f710Config)
                );
            default:
                return Promise.reject(`${config.type} is not yet supported`);
        }
    }
}
