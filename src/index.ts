import * as ConfigSchema from './Configuration/IConfigurationStructure.json';

import { AtemBuilder } from './VideoMixer/Blackmagicdesign/AtemBuilder';
import { CameraConnectionFactory } from './CameraConnection/CameraConnectionFactory';
import { ConfigValidator } from './Configuration/ConfigValidator';
import { HmiFactory } from './Hmi/HmiFactory';
import { IBuilder } from './GenericFactory/IBuilder';
import { ICameraConnection } from './CameraConnection/ICameraConnection';
import { IConfig } from './Configuration/IConfig';
import { IConfigurationStructure } from './Configuration/IConfigurationStructure';
import { IConnection } from './GenericFactory/IConnection';
import { IDisposable } from './GenericFactory/IDisposable';
import { IHmi } from './Hmi/IHmi';
import { ILogger } from './Logger/ILogger';
import { IVideoMixer } from './VideoMixer/IVideoMixer';
import { PtzLancCameraBuilder } from './CameraConnection/PtzLancCamera/PtzLancCameraBuilder';
import { VideomixerFactory } from './VideoMixer/VideoMixerFactory';

export class Core implements IDisposable {
    private _camFactory = new CameraConnectionFactory();
    private _mixerFactory = new VideomixerFactory();
    private _hmiFactory = new HmiFactory();

    public get CameraFactory(): CameraConnectionFactory {
        return this._camFactory;
    }

    public get MixerFactory(): VideomixerFactory {
        return this._mixerFactory;
    }

    public get HmiFactory(): HmiFactory {
        return this._hmiFactory;
    }

    public async bootstrap(logger: ILogger, config: any): Promise<void> {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<IConfigurationStructure>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(logger, 'Failed to load configuration');
            this.error(logger, configValidator.errorGet());
            return;
        }

        await this._camFactory.builderAdd(new PtzLancCameraBuilder(logger));
        await this._mixerFactory.builderAdd(new AtemBuilder(logger, this._camFactory));

        for (const cam of validConfig.cams) {
            this._camFactory.parseConfig(cam, logger);
        }

        for (const videoMixer of validConfig.videoMixers) {
            this._mixerFactory.parseConfig(videoMixer, logger);
        }

        for (const hmi of validConfig.interfaces) {
            this._hmiFactory.parseConfig(hmi, logger);
        }
    }

    private error(logger: ILogger, error: string): void {
        logger.error(`Core: ${error}`);
    }

    public async dispose(): Promise<void> {
        await this._camFactory.dispose();
        await this._mixerFactory.dispose();
        await this._hmiFactory.dispose();
    }
}

export { IConfig };
export { IHmi };
export { IBuilder };
export { ILogger };
export { VideomixerFactory };
export { CameraConnectionFactory };
export { IConnection };
export { IVideoMixer };
export { ICameraConnection };
