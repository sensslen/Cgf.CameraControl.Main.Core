import { EInputChangeDirection } from './EInputChangeDirection';

export interface IGeneralGamepadConfig {
    serialNumber?: string;
    videoMixer: { connection: number; mixBlock: number };
    connectionChange: {
        default: { [key in EInputChangeDirection]?: number };
        alt?: { [key in EInputChangeDirection]?: number };
        altLower?: { [key in EInputChangeDirection]?: number };
    };
}
