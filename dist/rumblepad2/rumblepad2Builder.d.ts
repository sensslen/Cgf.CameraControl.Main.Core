import { IBuilder, IConfig, IHmi, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
export declare class rumblepad2Builder implements IBuilder<IHmi> {
    private logger;
    private mixerFactory;
    constructor(logger: ILogger, mixerFactory: VideomixerFactory);
    Type: string;
    build(config: IConfig): IHmi | undefined;
    private error;
}
