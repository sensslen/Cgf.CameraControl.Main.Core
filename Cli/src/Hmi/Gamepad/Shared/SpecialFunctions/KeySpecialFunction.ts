import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionKeyConfig } from './ISpecialFunctionKeyConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class KeySpecialFunction implements ISpecialFunction {
    constructor(private config: ISpecialFunctionKeyConfig) {}

    run(mixer: IVideoMixer): void {
        mixer.toggleKey(this.config.index);
    }
}
