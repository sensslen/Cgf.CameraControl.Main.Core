import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { ConfigValidator } from '../../ConfigValidator';
import { ILogitechFx10Config } from './ILogitechFx10Config';
import * as ConfigSchema from './ILogitechFx10Config.json';
import * as f710Config from '@sensslen/node-gamepad/controllers/logitech/gamepadf710.json';
import * as f310Config from '@sensslen/node-gamepad/controllers/logitech/gamepadf310.json';
import { Fx10 } from './Fx10';

export class Fx10Builder implements IBuilder<IHmi> {
    constructor(private logger: ILogger, private mixerFactory: VideomixerFactory) {}

    private readonly f310Name = 'logitech/F310';
    private readonly f710Name = 'logitech/F710';
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve([this.f310Name, this.f710Name]);
    }

    build(config: IConfig): IHmi | undefined {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<ILogitechFx10Config>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        switch (config.type) {
            case this.f310Name:
                return new Fx10(validConfig, this.logger, this.mixerFactory, f310Config);
            case this.f710Name:
                return new Fx10(validConfig, this.logger, this.mixerFactory, f710Config);
            default:
                return undefined;
        }
    }

    private error(error: string): void {
        this.logger.error(`F310Builder: ${error}`);
    }
}
