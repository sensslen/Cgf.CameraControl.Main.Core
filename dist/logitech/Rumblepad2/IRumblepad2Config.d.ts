import { IGeneralGamepadConfig } from '../../ConfigurationHelper/IGeneralGamepadConfig';
import { ISpecialFunctionDefinition } from '../../ConfigurationHelper/ISpecialFunctionDefinition';
import { eRumblepadSpecialFunctionKey } from './eRumblepadSpecialFunctionKey';
export interface IRumblepad2Config extends IGeneralGamepadConfig {
    SpecialFunction: {
        Default: {
            [key in eRumblepadSpecialFunctionKey]?: ISpecialFunctionDefinition;
        };
        Alt?: {
            [key in eRumblepadSpecialFunctionKey]?: ISpecialFunctionDefinition;
        };
        AltLower?: {
            [key in eRumblepadSpecialFunctionKey]?: ISpecialFunctionDefinition;
        };
    };
}
