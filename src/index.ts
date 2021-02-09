import { ILogger } from './Logger/ILogger';
import { CameraConnectionFactory } from './CameraConnection/CameraConnectionFactory';
import { PtzLancCameraBuilder } from './CameraConnection/PtzLancCamera/PtzLancCameraBuilder';
import { HmiFactory } from './Hmi/HmiFactory';
import { VideomixerFactory } from './VideoMixer/VideoMixerFactory';
import { AtemBuilder } from './VideoMixer/Blackmagicdesign/AtemBuilder';
import { IBuilder } from './GenericFactory/IBuilder';
import { IHmi } from './Hmi/IHmi';
import { IConfigurationStructure } from './Configuration/IConfigurationStructure';
import { IConfig } from './GenericFactory/IConfig';
import { IConnection } from './GenericFactory/IConnection';

export class Core {
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

    bootstrap(logger: ILogger, config: IConfigurationStructure) {
        this._camFactory.builderAdd(new PtzLancCameraBuilder(logger));
        this._mixerFactory.builderAdd(new AtemBuilder(logger, this._camFactory));

        for (let cam of config.cams) {
            this._camFactory.parseConfig(cam);
        }

        for (let videoMixer of config.videoMixers) {
            this._mixerFactory.parseConfig(videoMixer);
        }

        for (let hmi of config.interfaces) {
            this._hmiFactory.parseConfig(hmi);
        }
    }
}

export { IHmi };
export { IBuilder };
export { IConfig };
export { ILogger };
export { VideomixerFactory };
export { CameraConnectionFactory };
export { IConnection };
