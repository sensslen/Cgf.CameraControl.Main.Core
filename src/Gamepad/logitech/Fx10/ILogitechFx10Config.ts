import { EFx10SpecialFunctionKey } from './EFx10SpecialFunctionKey';
import { IGeneralGamepadConfig } from '../../ConfigurationHelper/IGeneralGamepadConfig';
import { ISpecialFunctionDefinition } from '../../ConfigurationHelper/ISpecialFunctionDefinition';

export interface ILogitechFx10Config extends IGeneralGamepadConfig {
    specialFunction: {
        default: { [key in EFx10SpecialFunctionKey]?: ISpecialFunctionDefinition };
        alt?: { [key in EFx10SpecialFunctionKey]?: ISpecialFunctionDefinition };
        altLower?: { [key in EFx10SpecialFunctionKey]?: ISpecialFunctionDefinition };
    };
}
