import * as ConnectionChangeSchema from './ISpecialFunctionConnectionChangeConfig.json';
import * as KeySchema from './ISpecialFunctionKeyConfig.json';
import * as MacroSchema from './ISpecialFunctionMacroLoopConfig.json';

import { ESpecialFunctionType, ISpecialFunctionDefinition } from './ISpecialFunctionDefinition';

import { ConfigValidator } from '../../../../ConfigValidator';
import { ConnectionChangeSpecialFunction } from './ConnectionChangeSpecialFunction';
import { ISpecialFunction } from './ISpecialFunction';
import { ISpecialFunctionConnectionChangeConfig } from './ISpecialFunctionConnectionChangeConfig';
import { ISpecialFunctionKeyConfig } from './ISpecialFunctionKeyConfig';
import { ISpecialFunctionMacroLoopConfig } from './ISpecialFunctionMacroLoopConfig';
import { KeySpecialFunction } from './KeySpecialFunction';
import { MacroSpecialFunction } from './MacroSpecialFunction';

export class SpecialFunctionFactory {
    public static get(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        switch (config.type) {
            case ESpecialFunctionType.key:
                return SpecialFunctionFactory.buildKeySpecialFunction(config);
            case ESpecialFunctionType.macroLoop:
                return SpecialFunctionFactory.buildMacroLoopSpecialFunction(config);
            case ESpecialFunctionType.connectionChange:
                return SpecialFunctionFactory.buildConnectionChangeSpecialFunction(config);
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
        const validConfig = configValidator.validate<ISpecialFunctionMacroLoopConfig>(config, MacroSchema);

        if (validConfig === undefined) {
            return undefined;
        }
        return new MacroSpecialFunction(validConfig);
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
}
