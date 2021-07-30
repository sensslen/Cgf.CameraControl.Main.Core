import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionMacroConfig } from './ISpecialFunctionMacroConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class MacroSpecialFunction implements ISpecialFunction {
    private nextIndex = 0;
    constructor(private config: ISpecialFunctionMacroConfig) {}

    run(mixer: IVideoMixer): void {
        mixer.runMacro(this.config.indexes[this.nextIndex]);
        this.nextIndex++;
        if (this.nextIndex >= this.config.indexes.length) {
            this.nextIndex = 0;
        }
    }
}
