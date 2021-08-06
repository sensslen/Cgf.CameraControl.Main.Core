import { IVideoMixer } from 'cgf.cameracontrol.main.core';

export interface ISpecialFunction {
    run(mixer: IVideoMixer): void;
}
