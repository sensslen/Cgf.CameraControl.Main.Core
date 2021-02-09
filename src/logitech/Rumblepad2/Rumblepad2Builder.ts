import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { ConfigValidator } from '../../ConfigValidator';
import { IRumblepad2Config } from './IRumblepad2Config';
import * as ConfigSchema from './IRumblepad2Config.json';
import { Rumblepad2 } from './Rumblepad2';

export class Rumblepad2Builder implements IBuilder<IHmi> {
    constructor(private logger: ILogger, private mixerFactory: VideomixerFactory) {}

    Type = nameof<Rumblepad2>();

    build(config: IConfig): IHmi | undefined {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<IRumblepad2Config>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        return new Rumblepad2(validConfig, this.logger, this.mixerFactory);
    }

    private error(error: string): void {
        this.logger.error(`${nameof(Rumblepad2Builder)}: ${error}`);
    }
}
