import * as ConfigSchema from './IAtemConfig.json';

import { Atem } from './Atem';
import { CameraConnectionFactory } from '../../CameraConnection/CameraConnectionFactory';
import { ConfigValidator } from '../../Configuration/ConfigValidator';
import { IAtemConfig } from './IAtemConfig';
import { IBuilder } from '../../GenericFactory/IBuilder';
import { IConfig } from '../../Configuration/IConfig';
import { ILogger } from '../../Logger/ILogger';
import { IVideoMixer } from '../IVideoMixer';

export class AtemBuilder implements IBuilder<IVideoMixer> {
    constructor(private logger: ILogger, private cameraFactory: CameraConnectionFactory) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['blackmagicdesign/Atem']);
    }

    public build(config: IConfig): Promise<IVideoMixer | undefined> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IAtemConfig>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return Promise.resolve(undefined);
        }

        return Promise.resolve(new Atem(validConfig, this.logger, this.cameraFactory));
    }

    private error(error: string): void {
        this.logger.error(`AtemBuilder: ${error}`);
    }
}
