import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { ConfigValidator } from '../../ConfigValidator';
import { Ilogitechf710Config } from './Ilogitechf710Config';
import * as ConfigSchema from './Ilogitechf710Config.json';
import { F710 } from './F710';

export class F710Builder implements IBuilder<IHmi> {
    constructor(private logger: ILogger, private mixerFactory: VideomixerFactory) {}

    Type = 'logitech/7710';

    build(config: IConfig): IHmi | undefined {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<Ilogitechf710Config>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        return new F710(validConfig, this.logger, this.mixerFactory);
    }

    private error(error: string): void {
        this.logger.error(`F710Builder: ${error}`);
    }
}
