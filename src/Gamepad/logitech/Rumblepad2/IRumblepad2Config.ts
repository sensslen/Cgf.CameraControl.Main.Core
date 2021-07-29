import { ERumblepadSpecialFunctionKey } from './ERumblepadSpecialFunctionKey';
import { IGeneralGamepadConfig } from '../../ConfigurationHelper/IGeneralGamepadConfig';
import { ISpecialFunctionDefinition } from '../../ConfigurationHelper/ISpecialFunctionDefinition';

export interface IRumblepad2Config extends IGeneralGamepadConfig {
    specialFunction: {
        default: { [key in ERumblepadSpecialFunctionKey]?: ISpecialFunctionDefinition };
        alt?: { [key in ERumblepadSpecialFunctionKey]?: ISpecialFunctionDefinition };
        altLower?: { [key in ERumblepadSpecialFunctionKey]?: ISpecialFunctionDefinition };
    };
}
