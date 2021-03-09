import { IGeneralGamepadConfig } from '../../ConfigurationHelper/IGeneralGamepadConfig';
import { ISpecialFunctionDefinition } from '../../ConfigurationHelper/ISpecialFunctionDefinition';
import { eF710SpecialFunctionKey } from './eF710SpecialFunctionKey';

export interface Ilogitechf710Config extends IGeneralGamepadConfig {
    SpecialFunction: {
        Default: { [key in eF710SpecialFunctionKey]?: ISpecialFunctionDefinition };
        Alt?: { [key in eF710SpecialFunctionKey]?: ISpecialFunctionDefinition };
        AltLower?: { [key in eF710SpecialFunctionKey]?: ISpecialFunctionDefinition };
    };
}
