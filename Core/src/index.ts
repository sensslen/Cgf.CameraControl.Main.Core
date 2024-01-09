import { IConfig, configSchema } from './Configuration/IConfig';
import { CameraConnectionFactory } from './CameraConnection/CameraConnectionFactory';
import { HmiFactory } from './Hmi/HmiFactory';
import { IBuilder } from './GenericFactory/IBuilder';
import { ICameraConnection } from './CameraConnection/ICameraConnection';
import { IDisposable } from './GenericFactory/IDisposable';
import { IHmi } from './Hmi/IHmi';
import { IImageSelectionChange } from './VideoMixer/IImageSelectionChange';
import { ILogger } from './Logger/ILogger';
import { IVideoMixer } from './VideoMixer/IVideoMixer';
import { VideomixerFactory } from './VideoMixer/VideoMixerFactory';
import { fromZodError } from 'zod-validation-error';
import { rootConfigSchema } from './Configuration/IRootConfig';

export class Core implements IDisposable {
    private _camFactory = new CameraConnectionFactory();
    private _mixerFactory = new VideomixerFactory();
    private _hmiFactory = new HmiFactory();

    public get cameraFactory(): CameraConnectionFactory {
        return this._camFactory;
    }

    public get mixerFactory(): VideomixerFactory {
        return this._mixerFactory;
    }

    public get hmiFactory(): HmiFactory {
        return this._hmiFactory;
    }

    public async bootstrap(logger: ILogger, config: unknown): Promise<void> {
        const parseResult = rootConfigSchema.safeParse(config);
        if (parseResult.success === false) {
            this.error(logger, 'Failed to load configuration');
            this.error(logger, fromZodError(parseResult.error).toString());
            return;
        }

        const validConfig = parseResult.data;

        for (const cam of validConfig.cams) {
            await this._camFactory.parseConfig(cam, logger);
        }

        for (const videoMixer of validConfig.videoMixers) {
            await this._mixerFactory.parseConfig(videoMixer, logger);
        }

        for (const hmi of validConfig.interfaces) {
            await this._hmiFactory.parseConfig(hmi, logger);
        }
    }

    public async dispose(): Promise<void> {
        await this._camFactory.dispose();
        await this._mixerFactory.dispose();
        await this._hmiFactory.dispose();
    }

    private error(logger: ILogger, error: string): void {
        logger.error(`Core: ${error}`);
    }
}

export { IConfig };
export { IHmi };
export { IBuilder };
export { ILogger };
export { VideomixerFactory };
export { CameraConnectionFactory };
export { IVideoMixer };
export { IImageSelectionChange };
export { ICameraConnection };
export { configSchema };
