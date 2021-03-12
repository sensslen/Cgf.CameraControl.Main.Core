import { IGeneralGamepadConfig } from '../../ConfigurationHelper/IGeneralGamepadConfig';
import { ISpecialFunctionDefinition } from '../../ConfigurationHelper/ISpecialFunctionDefinition';
import { eFx10SpecialFunctionKey } from './eFx10SpecialFunctionKey';

export interface ILogitechFx10Config extends IGeneralGamepadConfig {
    SpecialFunction: {
        Default: { [key in eFx10SpecialFunctionKey]?: ISpecialFunctionDefinition };
        Alt?: { [key in eFx10SpecialFunctionKey]?: ISpecialFunctionDefinition };
        AltLower?: { [key in eFx10SpecialFunctionKey]?: ISpecialFunctionDefinition };
    };
}
