import { ISpecialFunction } from '../ISpecialFunction';
import { ISpecialFunctionMacroLoopConfig } from './ISpecialFunctionMacroLoopConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class MacroLoopSpecialFunction implements ISpecialFunction {
    private nextIndex = 0;
    constructor(private config: ISpecialFunctionMacroLoopConfig) {}

    run(mixer: IVideoMixer): void {
        mixer.runMacro(this.config.indexes[this.nextIndex]);
        this.nextIndex++;
        if (this.nextIndex >= this.config.indexes.length) {
            this.nextIndex = 0;
        }
    }
}
