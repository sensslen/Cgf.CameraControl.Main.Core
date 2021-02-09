import { eInputChangeDirection } from './eInputChangeDirection';

export interface IGeneralGamepadConfig {
    SerialNumber?: string;
    VideoMixer: { Connection: number; MixBlock: number };
    ConnectionChange: {
        Default: { [key in eInputChangeDirection]?: number };
        Alt?: { [key in eInputChangeDirection]?: number };
        AltLower?: { [key in eInputChangeDirection]?: number };
    };
}
