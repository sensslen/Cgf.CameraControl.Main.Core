import * as ConfigSchema from './IAtemConfig.json';

import { IBuilder, IConfig, ILogger, IVideoMixer } from 'cgf.cameracontrol.main.core';
import { Atem } from './Atem';
import { AtemFactory } from './AtemFactory';
import { ConfigValidator } from '../../ConfigValidator';
import { IAtemConfig } from './IAtemConfig';

export class AtemBuilder implements IBuilder<IVideoMixer> {
    private readonly atemFactory;
    constructor(logger: ILogger) {
        this.atemFactory = new AtemFactory(logger);
    }
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['blackmagicdesign/atem']);
    }

    public async build(config: IConfig): Promise<IVideoMixer> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IAtemConfig>(config, ConfigSchema);

        if (validConfig === undefined) {
            return Promise.reject(configValidator.errorGet());
        }

        const atem = new Atem(validConfig, this.atemFactory);
        await atem.startup();
        return atem;
    }
}
