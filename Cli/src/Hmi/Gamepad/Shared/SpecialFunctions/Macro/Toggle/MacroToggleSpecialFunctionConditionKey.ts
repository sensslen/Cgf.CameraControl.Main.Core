import { IMacroToggleSpecialFunctionCondition } from './IMacroToggleSpecialFunctionCondition';
import { ISpecialFunctionMacroToggleConfigConditionKeyConfiguration } from './ISpecialFunctionMacroToggleConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class MacroToggleSpecialFunctionConditionKey implements IMacroToggleSpecialFunctionCondition {
    constructor(private config: ISpecialFunctionMacroToggleConfigConditionKeyConfiguration) {}
    isActive(mixer: IVideoMixer): Promise<boolean> {
        return mixer.isKeySet(this.config.key);
    }
}
