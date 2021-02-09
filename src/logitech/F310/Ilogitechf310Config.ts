import { IGeneralGamepadConfig } from '../../ConfigurationHelper/IGeneralGamepadConfig';
import { ISpecialFunctionDefinition } from '../../ConfigurationHelper/ISpecialFunctionDefinition';
import { eF310SpecialFunctionKey } from './eF310SpecialFunctionKey';

export interface Ilogitechf310Config extends IGeneralGamepadConfig {
    SpecialFunction: {
        Default: { [key in eF310SpecialFunctionKey]?: ISpecialFunctionDefinition };
        Alt?: { [key in eF310SpecialFunctionKey]?: ISpecialFunctionDefinition };
        AltLower?: { [key in eF310SpecialFunctionKey]?: ISpecialFunctionDefinition };
    };
}
