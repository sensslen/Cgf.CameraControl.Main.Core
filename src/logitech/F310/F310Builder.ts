import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { ConfigValidator } from '../../ConfigValidator';
import { Ilogitechf310Config } from './Ilogitechf310Config';
import * as ConfigSchema from './Ilogitechf310Config.json';
import { F310 } from './F310';

export class F310Builder implements IBuilder<IHmi> {
    constructor(private logger: ILogger, private mixerFactory: VideomixerFactory) {}

    Type = `logitech/${nameof<F310>()}`;

    build(config: IConfig): IHmi | undefined {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<Ilogitechf310Config>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        return new F310(validConfig, this.logger, this.mixerFactory);
    }

    private error(error: string): void {
        this.logger.error(`${nameof(F310Builder)}: ${error}`);
    }
}
