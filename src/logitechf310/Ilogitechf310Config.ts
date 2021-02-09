export enum eInputChangeDirection {
    up = 'up',
    down = 'down',
    left = 'left',
    right = 'right',
}

export enum eSpecialFunctionKey {
    a = 'A',
    b = 'B',
    x = 'X',
    y = 'Y',
}

export enum eSpecialFunctionType {
    key = 'key',
    macro = 'macro',
}

interface ISpecialFunctionDefinition {
    type: eSpecialFunctionType;
    index: number;
}

export interface Ilogitechf310Config {
    SerialNumber?: string;
    VideoMixer: { Connection: number; MixBlock: number };
    ConnectionChange: {
        Default: { [key in eInputChangeDirection]?: number };
        Alt?: { [key in eInputChangeDirection]?: number };
        AltLower?: { [key in eInputChangeDirection]?: number };
    };
    SpecialFunction: {
        Default: { [key in eSpecialFunctionKey]?: ISpecialFunctionDefinition };
        Alt?: { [key in eSpecialFunctionKey]?: ISpecialFunctionDefinition };
        AltLower?: { [key in eSpecialFunctionKey]?: ISpecialFunctionDefinition };
    };
}
