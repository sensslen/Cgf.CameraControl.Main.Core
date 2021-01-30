import { ILogger } from './Logger/ILogger';
import { CameraConnectionFactory } from './CameraConnection/CameraConnectionFactory';
import { PtzLancCameraBuilder } from './CameraConnection/PtzLancCamera/PtzLancCameraBuilder';
import { HmiFactory } from './Hmi/HmiFactory';
import { VideomixerFactory } from './VideoMixer/VideoMixerFactory';
import { AtemBuilder } from './VideoMixer/Blackmagicdesign/AtemBuilder';
import { IBuilder } from './GenericFactory/IBuilder';
import { ICameraConnection } from './CameraConnection/ICameraConnection';
import { IVideoMixer } from './VideoMixer/IVideoMixer';
import { IHmi } from './Hmi/IHmi';
import { IConfigurationStructure } from './Configuration/IConfigurationStructure';
import { IConfig } from './GenericFactory/IConfig';

export class Core {
    private _camFactory = new CameraConnectionFactory();
    private _mixerFactory = new VideomixerFactory();
    private _hmiFactory = new HmiFactory();

    bootstrap(logger: ILogger, config: IConfigurationStructure) {
        this.cameraBuilderAdd(new PtzLancCameraBuilder(logger));
        this.videoMixerBuilderAdd(new AtemBuilder(logger, this._camFactory));

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

    cameraBuilderAdd(builder: IBuilder<ICameraConnection>) {
        this._camFactory.builderAdd(builder);
    }

    videoMixerBuilderAdd(builder: IBuilder<IVideoMixer>) {
        this._mixerFactory.builderAdd(builder);
    }

    interfaceBuilderAdd(builder: IBuilder<IHmi>) {
        this._hmiFactory.builderAdd(builder);
    }
}

export { IHmi };
export { IBuilder };
export { IConfig };
