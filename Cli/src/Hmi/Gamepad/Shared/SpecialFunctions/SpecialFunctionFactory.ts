import { ESpecialFunctionType, ISpecialFunctionDefinition } from './ISpecialFunctionDefinition';
import { ConnectionChangeSpecialFunction } from './ConnectionChangeSpecialFunction';
import { ISpecialFunction } from './ISpecialFunction';
import { KeySpecialFunction } from './KeySpecialFunction';
import { MacroLoopSpecialFunction } from './Macro/MacroLoopSpecialFunction';
import { MacroToggleSpecialFunction } from './Macro/Toggle/MacroToggleSpecialFunction';
import { specialFunctionConnectionChangeConfigurationSchema } from './ISpecialFunctionConnectionChangeConfig';
import { specialFunctionKeyConfigurationSchema } from './ISpecialFunctionKeyConfig';
import { specialFunctionMacroLoopConfigurationSchema } from './Macro/ISpecialFunctionMacroLoopConfig';
import { specialFunctionMacroToggleConfigurationSchema } from './Macro/Toggle/ISpecialFunctionMacroToggleConfig';

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
        const parseResult = specialFunctionKeyConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return undefined;
        }

        return new KeySpecialFunction(parseResult.data);
    }

    private static buildMacroLoopSpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        const parseResult = specialFunctionMacroLoopConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return undefined;
        }

        return new MacroLoopSpecialFunction(parseResult.data);
    }

    private static buildConnectionChangeSpecialFunction(
        config: ISpecialFunctionDefinition
    ): ISpecialFunction | undefined {
        const parseResult = specialFunctionConnectionChangeConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return undefined;
        }

        return new ConnectionChangeSpecialFunction(parseResult.data);
    }

    private static buildMacroToggleSpecialFunction(config: ISpecialFunctionDefinition): ISpecialFunction | undefined {
        const parseResult = specialFunctionMacroToggleConfigurationSchema.safeParse(config);
        if (parseResult.success === false) {
            return undefined;
        }

        return new MacroToggleSpecialFunction(parseResult.data);
    }
}
