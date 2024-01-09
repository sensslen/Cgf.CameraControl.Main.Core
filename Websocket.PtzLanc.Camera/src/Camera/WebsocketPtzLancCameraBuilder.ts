import { IBuilder } from 'cgf.cameracontrol.main.core';
import { ICameraConnection } from 'cgf.cameracontrol.main.core';
import { IConfig } from 'cgf.cameracontrol.main.core';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { WebsocketPtzLancCamera } from './WebsocketPtzLancCamera';
import { fromZodError } from 'zod-validation-error';
import { websocketPtzLancCameraConfigurationSchema } from './IWebsocketPtzLancCameraConfiguration';

export class WebsocketPtzLancCameraBuilder implements IBuilder<ICameraConnection> {
    constructor(private logger: ILogger) {}
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['Websocket.PtzLanc']);
    }

    public build(config: IConfig): Promise<ICameraConnection> {
        const parseResult = websocketPtzLancCameraConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return Promise.reject(fromZodError(parseResult.error));
        }

        return Promise.resolve(new WebsocketPtzLancCamera(parseResult.data, this.logger));
    }
}
