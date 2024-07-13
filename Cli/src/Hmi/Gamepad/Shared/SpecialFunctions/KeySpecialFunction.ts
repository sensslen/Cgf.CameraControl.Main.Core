import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionKeyConfiguration } from './ISpecialFunctionKeyConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class KeySpecialFunction implements ISpecialFunction {
    constructor(private config: ISpecialFunctionKeyConfiguration) {}

    run(mixer: IVideoMixer): void {
        mixer.toggleKey(this.config.index);
    }
}
