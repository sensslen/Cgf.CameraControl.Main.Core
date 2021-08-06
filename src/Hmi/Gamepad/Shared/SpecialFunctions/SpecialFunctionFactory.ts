import * as ConnectionChangeSchema from './ISpecialFunctionConnectionChangeConfig.json';
import * as KeySchema from './ISpecialFunctionKeyConfig.json';
import * as MacroLoopSchema from './Macro/ISpecialFunctionMacroLoopConfig.json';
import * as MacroToggleSchema from './Macro/Toggle/ISpecialFunctionMacroToggleConfig.json';

import { ESpecialFunctionType, ISpecialFunctionDefinition } from './ISpecialFunctionDefinition';

import { ConfigValidator } from '../../../../ConfigValidator';
import { ConnectionChangeSpecialFunction } from './ConnectionChangeSpecialFunction';
import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionConnectionChangeConfig } from './ISpecialFunctionConnectionChangeConfig';
import { ISpecialFunctionKeyConfig } from './ISpecialFunctionKeyConfig';
import { ISpecialFunctionMacroLoopConfig } from './Macro/ISpecialFunctionMacroLoopConfig';
import { ISpecialFunctionMacroToggleConfig } from './Macro/Toggle/ISpecialFunctionMacroToggleConfig';
import { KeySpecialFunction } from './KeySpecialFunction';
import { MacroLoopSpecialFunction } from './Macro/MacroLoopSpecialFunction';
import { MacroToggleSpecialFunction } from './Macro/Toggle/MacroToggleSpecialFunction';

export class SpecialFunctionFactory {
    public static get(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        switch (config.type) {
            case ESpecialFunctionType.key:
                return SpecialFunctionFactory.buildKeySpecialFunction(config);
            case ESpecialFunctionType.macroLoop:
                return SpecialFunctionFactory.buildMacroLoopSpecialFunction(config);
            case ESpecialFunctionType.connectionChange:
                return SpecialFunctionFactory.buildConnectionChangeSpecialFunction(config);
            case ESpecialFunctionType.macroToggle:
                return SpecialFunctionFactory.buildMacroToggleSpecialFunction(config);
            default:
                return undefined;
        }
    }

    private static buildKeySpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionKeyConfig>(config, KeySchema);

        if (validConfig === undefined) {
            return undefined;
        }
        return new KeySpecialFunction(validConfig);
    }

    private static buildMacroLoopSpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionMacroLoopConfig>(config, MacroLoopSchema);

        if (validConfig === undefined) {
            return undefined;
        }
        return new MacroLoopSpecialFunction(validConfig);
    }

    private static buildConnectionChangeSpecialFunction(
        config: ISpecialFunctionDefinition
    ): ISpecialFunction | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionConnectionChangeConfig>(
            config,
            ConnectionChangeSchema
        );

        if (validConfig === undefined) {
            return undefined;
        }
        return new ConnectionChangeSpecialFunction(validConfig);
    }

    private static buildMacroToggleSpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        const configValidator = new ConfigValidator();
        const validConfig = configValidator.validate<ISpecialFunctionMacroToggleConfig>(config, MacroToggleSchema);

        if (validConfig === undefined) {
            return undefined;
        }
        return new MacroToggleSpecialFunction(validConfig);
    }
}
