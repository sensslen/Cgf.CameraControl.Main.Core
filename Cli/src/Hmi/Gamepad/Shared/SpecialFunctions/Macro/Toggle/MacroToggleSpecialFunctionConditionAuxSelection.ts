import { IMacroToggleSpecialFunctionCondition } from './IMacroToggleSpecialFunctionCondition';
import { ISpecialFunctionMacroToggleConfigConditionAuxSelection } from './ISpecialFunctionMacroToggleConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class MacroToggleSpecialFunctionConditionAuxSelection implements IMacroToggleSpecialFunctionCondition {
    constructor(private config: ISpecialFunctionMacroToggleConfigConditionAuxSelection) {}
    async isActive(mixer: IVideoMixer): Promise<boolean> {
        const currentSelection = await mixer.getAuxilarySelection(this.config.aux);
        return currentSelection === this.config.selection;
    }
}
