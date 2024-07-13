import { IMacroToggleSpecialFunctionCondition } from './IMacroToggleSpecialFunctionCondition';
import { ISpecialFunctionMacroToggleConfigConditionAuxSelectionConfiguration } from './ISpecialFunctionMacroToggleConfig';
import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export class MacroToggleSpecialFunctionConditionAuxSelection implements IMacroToggleSpecialFunctionCondition {
    constructor(private config: ISpecialFunctionMacroToggleConfigConditionAuxSelectionConfiguration) {}
    async isActive(mixer: IVideoMixer): Promise<boolean> {
        const currentSelection = await mixer.getAuxilarySelection(this.config.aux);
        return currentSelection === this.config.selection;
    }
}
