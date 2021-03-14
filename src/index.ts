import { ILogger } from './Logger/ILogger';
import { CameraConnectionFactory } from './CameraConnection/CameraConnectionFactory';
import { PtzLancCameraBuilder } from './CameraConnection/PtzLancCamera/PtzLancCameraBuilder';
import { HmiFactory } from './Hmi/HmiFactory';
import { VideomixerFactory } from './VideoMixer/VideoMixerFactory';
import { AtemBuilder } from './VideoMixer/Blackmagicdesign/AtemBuilder';
import { IBuilder } from './GenericFactory/IBuilder';
import { IHmi } from './Hmi/IHmi';
import { IConfigurationStructure } from './Configuration/IConfigurationStructure';
import * as ConfigSchema from './Configuration/IConfigurationStructure.json';
import { IConnection } from './GenericFactory/IConnection';
import { ConfigValidator } from './Configuration/ConfigValidator';
import { IConfig } from './Configuration/IConfig';
import { IVideoMixer } from './VideoMixer/IVideoMixer';
import { ICameraConnection } from './CameraConnection/ICameraConnection';
import { IDisposable } from './GenericFactory/IDisposable';

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

    bootstrap(logger: ILogger, config: any) {
        let configValidator = new ConfigValidator();
        let validConfig = configValidator.validate<IConfigurationStructure>(config, ConfigSchema);

        if (validConfig === undefined) {
            this.error(logger, 'Failed to load configuration');
            this.error(logger, configValidator.errorGet());
            return;
        }

        this._camFactory.builderAdd(new PtzLancCameraBuilder(logger));
        this._mixerFactory.builderAdd(new AtemBuilder(logger, this._camFactory));

        for (let cam of validConfig.cams) {
            this._camFactory.parseConfig(cam);
        }

        for (let videoMixer of validConfig.videoMixers) {
            this._mixerFactory.parseConfig(videoMixer);
        }

        for (let hmi of validConfig.interfaces) {
            this._hmiFactory.parseConfig(hmi);
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
