import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionConnectionChangeConfig } from './ISpecialFunctionConnectionChangeConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class ConnectionChangeSpecialFunction implements ISpecialFunction {
    constructor(private config: ISpecialFunctionConnectionChangeConfig) {}

    run(mixer: IVideoMixer): void {
        mixer.changeInput(this.config.index);
    }
}
