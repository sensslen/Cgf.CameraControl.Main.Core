import * as ISpecialFunctionMacroToggleConfigConditionAuxSelectionSchema from './ISpecialFunctionMacroToggleConfigConditionAuxSelection.json';
import * as ISpecialFunctionMacroToggleConfigConditionKeySchema from './ISpecialFunctionMacroToggleConfigConditionKey.json';

import {
    EMacroToggleConditionType,
    ISpecialFunctionMacroToggleConfigCondition,
    ISpecialFunctionMacroToggleConfigConditionAuxSelection,
    ISpecialFunctionMacroToggleConfigConditionKey,
} from './ISpecialFunctionMacroToggleConfig';
import { ConfigValidator } from '../../../../../../ConfigValidator';
import { IMacroToggleSpecialFunctionCondition } from './IMacroToggleSpecialFunctionCondition';
import { MacroToggleSpecialFunctionConditionAuxSelection } from './MacroToggleSpecialFunctionConditionAuxSelection';
import { MacroToggleSpecialFunctionConditionKey } from './MacroToggleSpecialFunctionConditionKey';

export class MacroToggleSpecialFunctionConditionFactory {
    public static get(
        config: ISpecialFunctionMacroToggleConfigCondition
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
        config: ISpecialFunctionMacroToggleConfigCondition
    ): IMacroToggleSpecialFunctionCondition | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionMacroToggleConfigConditionKey>(
            config,
            ISpecialFunctionMacroToggleConfigConditionKeySchema
        );

        if (validConfig === undefined) {
            return undefined;
        }
        return new MacroToggleSpecialFunctionConditionKey(validConfig);
    }

    private static getAuxSelectionCondition(
        config: ISpecialFunctionMacroToggleConfigCondition
    ): IMacroToggleSpecialFunctionCondition | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionMacroToggleConfigConditionAuxSelection>(
            config,
            ISpecialFunctionMacroToggleConfigConditionAuxSelectionSchema
        );

        if (validConfig === undefined) {
            return undefined;
        }
        return new MacroToggleSpecialFunctionConditionAuxSelection(validConfig);
    }
}
