import { ISpecialFunctionDefinition } from '../ISpecialFunctionDefinition';

export interface ISpecialFunctionMacroLoopConfig extends ISpecialFunctionDefinition {
    indexes: [number, ...number[]];
}
