import { CameraConnectionFactory, IBuilder, IHmi, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConfig } from 'cgf.cameracontrol.main.core';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { Rumblepad2 } from './Rumblepad2';
import { fromZodError } from 'zod-validation-error';
import { rumblepad2ConfigurationShema } from './IRumblepad2Config';

export class Rumblepad2Builder implements IBuilder<IHmi> {
    constructor(
        private logger: ILogger,
        private mixerFactory: VideomixerFactory,
        private cameraFactory: CameraConnectionFactory
    ) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['logitech/Rumblepad2']);
    }

    public build(config: IConfig): Promise<IHmi> {
        const parseResult = rumblepad2ConfigurationShema.safeParse(config);
        if (parseResult.success === false) {
            return Promise.reject(fromZodError(parseResult.error));
        }

        return Promise.resolve(new Rumblepad2(parseResult.data, this.logger, this.mixerFactory, this.cameraFactory));
    }
}
