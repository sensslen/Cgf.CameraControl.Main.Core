import { IConfig } from 'cgf.cameracontrol.main.core';
import { ISpecialFunctionDefinition } from './SpecialFunctions/ISpecialFunctionDefinition';

export enum EButtonDirection {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
}

export interface IGamepadConfiguration extends IConfig {
    videoMixer: number;
    connectionChange: {
        default: { [key in EButtonDirection]?: number };
        alt?: { [key in EButtonDirection]?: number };
        altLower?: { [key in EButtonDirection]?: number };
    };
    specialFunction: {
        default: { [key in EButtonDirection]?: ISpecialFunctionDefinition };
        alt?: { [key in EButtonDirection]?: ISpecialFunctionDefinition };
        altLower?: { [key in EButtonDirection]?: ISpecialFunctionDefinition };
    };
    /**
     * This map maps camera indexes to the mixer's input channel.
     * In the map the key is the input number on the mixer and the value is
     * the camera index in the configuration
     */
    cameraMap: { [key: number]: number };
}
