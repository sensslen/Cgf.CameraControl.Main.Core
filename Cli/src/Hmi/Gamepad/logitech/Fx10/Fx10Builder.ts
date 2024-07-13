import * as f310Config from '@sensslen/node-gamepad/controllers/logitech/gamepadf310.json';
import * as f710Config from '@sensslen/node-gamepad/controllers/logitech/gamepadf710.json';

import { CameraConnectionFactory, IBuilder, IHmi, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { Fx10 } from './Fx10';
import { IConfig } from 'cgf.cameracontrol.main.core';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { fromZodError } from 'zod-validation-error';
import { logitechFx10ConfigurationShema } from './ILogitechFx10Config';

export class Fx10Builder implements IBuilder<IHmi> {
    private readonly f310Name = 'logitech/F310';
    private readonly f710Name = 'logitech/F710';

    constructor(
        private logger: ILogger,
        private mixerFactory: VideomixerFactory,
        private cameraFactory: CameraConnectionFactory
    ) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve([this.f310Name, this.f710Name]);
    }

    public build(config: IConfig): Promise<IHmi> {
        const parseResult = logitechFx10ConfigurationShema.safeParse(config);
        if (parseResult.success === false) {
            return Promise.reject(fromZodError(parseResult.error));
        }

        switch (config.type) {
            case this.f310Name:
                return Promise.resolve(
                    new Fx10(parseResult.data, this.logger, this.mixerFactory, this.cameraFactory, f310Config)
                );
            case this.f710Name:
                return Promise.resolve(
                    new Fx10(parseResult.data, this.logger, this.mixerFactory, this.cameraFactory, f710Config)
                );
            default:
                return Promise.reject(`${config.type} is not yet supported`);
        }
    }
}
