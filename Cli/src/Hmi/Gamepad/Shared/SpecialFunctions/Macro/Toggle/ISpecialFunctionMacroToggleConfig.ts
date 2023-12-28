import { ISpecialFunctionDefinition } from '../../ISpecialFunctionDefinition';

export enum EMacroToggleConditionType {
    key = 'key',
    auxSelection = 'aux_selection',
}

export interface ISpecialFunctionMacroToggleConfigCondition {
    type: EMacroToggleConditionType;
}

export interface ISpecialFunctionMacroToggleConfig extends ISpecialFunctionDefinition {
    indexOn: number;
    indexOff: number;
    condition: ISpecialFunctionMacroToggleConfigCondition;
}

export interface ISpecialFunctionMacroToggleConfigConditionKey extends ISpecialFunctionMacroToggleConfigCondition {
    key: number;
}

export interface ISpecialFunctionMacroToggleConfigConditionAuxSelection
    extends ISpecialFunctionMacroToggleConfigCondition {
    aux: number;
    selection: number;
}
