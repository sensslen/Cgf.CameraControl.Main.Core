export enum ESpecialFunctionType {
    key = 'key',
    macroLoop = 'macroLoop',
    connectionChange = 'connectionChange',
    macroToggle = 'macroToggle',
}

export interface ISpecialFunctionDefinition {
    type: ESpecialFunctionType;
}
