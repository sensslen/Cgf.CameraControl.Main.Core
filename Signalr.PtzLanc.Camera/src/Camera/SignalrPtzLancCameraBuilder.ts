import { IBuilder } from 'cgf.cameracontrol.main.core';
import { ICameraConnection } from 'cgf.cameracontrol.main.core';
import { IConfig } from 'cgf.cameracontrol.main.core';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { SignalrPtzLancCamera } from './SignalrPtzLancCamera';
import { fromZodError } from 'zod-validation-error';
import { signalrPtzLancCameraConfigurationSchema } from './ISignalrPtzLancCameraConfiguration';

export class SignalrPtzLancCameraBuilder implements IBuilder<ICameraConnection> {
    constructor(private logger: ILogger) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['Signalr.PtzLanc']);
    }

    public build(config: IConfig): Promise<ICameraConnection> {
        const parseResult = signalrPtzLancCameraConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return Promise.reject(fromZodError(parseResult.error));
        }

        return Promise.resolve(new SignalrPtzLancCamera(parseResult.data, this.logger));
    }
}
