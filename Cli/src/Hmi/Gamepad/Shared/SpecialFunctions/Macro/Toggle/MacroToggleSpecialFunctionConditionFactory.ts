import {
    EMacroToggleConditionType,
    ISpecialFunctionMacroToggleConditionConfiguration,
    specialFunctionMacroToggleConfigConditionAuxSelectionConfigurationSchema,
    specialFunctionMacroToggleConfigConditionKeyConfigurationSchema,
} from './ISpecialFunctionMacroToggleConfig';
import { IMacroToggleSpecialFunctionCondition } from './IMacroToggleSpecialFunctionCondition';
import { MacroToggleSpecialFunctionConditionAuxSelection } from './MacroToggleSpecialFunctionConditionAuxSelection';
import { MacroToggleSpecialFunctionConditionKey } from './MacroToggleSpecialFunctionConditionKey';

export class MacroToggleSpecialFunctionConditionFactory {
    public static get(
        config: ISpecialFunctionMacroToggleConditionConfiguration
    ): IMacroToggleSpecialFunctionCondition | undefined {
        switch (config.type) {
            case EMacroToggleConditionType.key:
                return MacroToggleSpecialFunctionConditionFactory.getKeyCondition(config);
            case EMacroToggleConditionType.auxSelection:
                return MacroToggleSpecialFunctionConditionFactory.getAuxSelectionCondition(config);
            default:
                return undefined;
        }
    }

    private static getKeyCondition(
        config: ISpecialFunctionMacroToggleConditionConfiguration
    ): IMacroToggleSpecialFunctionCondition | undefined {
        const parseResult = specialFunctionMacroToggleConfigConditionKeyConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return undefined;
        }
        return new MacroToggleSpecialFunctionConditionKey(parseResult.data);
    }

    private static getAuxSelectionCondition(
        config: ISpecialFunctionMacroToggleConditionConfiguration
    ): IMacroToggleSpecialFunctionCondition | undefined {
        const parseResult = specialFunctionMacroToggleConfigConditionAuxSelectionConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return undefined;
        }
        return new MacroToggleSpecialFunctionConditionAuxSelection(parseResult.data);
    }
}
