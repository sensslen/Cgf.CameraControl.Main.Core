import { IConfig } from '../../Configuration/IConfig';
import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IBuilder } from '../../GenericFactory/IBuilder';
import { IVideoMixer } from '../IVideoMixer';
import { Atem } from './Atem';
import { IAtemConfig } from './IAtemConfig';
import * as ConfigSchema from './IAtemConfig.json';
import { ILogger } from '../../Logger/ILogger';
import { CameraConnectionFactory } from '../../CameraConnection/CameraConnectionFactory';

export class AtemBuilder implements IBuilder<IVideoMixer> {
    constructor(private logger: ILogger, private cameraFactory: CameraConnectionFactory) {}

    Type = nameof<Atem>();

    build(config: IConfig): IVideoMixer | undefined {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<IAtemConfig>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }

        return new Atem(validConfig, this.logger, this.cameraFactory);
    }

    private error(error: string): void {
        this.logger.error(`${nameof(AtemBuilder)}: ${error}`);
    }
}
