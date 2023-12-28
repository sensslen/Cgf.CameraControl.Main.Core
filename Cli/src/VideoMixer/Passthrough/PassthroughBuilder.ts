import { IBuilder, IConfig, IVideoMixer } from 'cgf.cameracontrol.main.core';
import { Passthrough } from './Passthrough';

export class PassthroughBuilder implements IBuilder<IVideoMixer> {
    public supportedTypes(): Promise<string[]> {
        return Promise.resolve(['passthrough/default']);
    }

    public async build(config: IConfig): Promise<IVideoMixer> {
        const mixer = new Passthrough(config);
        return mixer;
    }
}
