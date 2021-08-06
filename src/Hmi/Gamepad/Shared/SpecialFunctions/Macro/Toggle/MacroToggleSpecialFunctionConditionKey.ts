import { IMacroToggleSpecialFunctionCondition } from './IMacroToggleSpecialFunctionCondition';
import { ISpecialFunctionMacroToggleConfigConditionKey } from './ISpecialFunctionMacroToggleConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class MacroToggleSpecialFunctionConditionKey implements IMacroToggleSpecialFunctionCondition {
    constructor(private config: ISpecialFunctionMacroToggleConfigConditionKey) {}
    isActive(mixer: IVideoMixer): Promise<boolean> {
        return mixer.isKeySet(this.config.key);
    }
}
