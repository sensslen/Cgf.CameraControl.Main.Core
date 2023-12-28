import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export interface IMacroToggleSpecialFunctionCondition {
    isActive(mixer: IVideoMixer): Promise<boolean>;
}
