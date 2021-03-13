import { IBuilder, IConfig, IConnection, ILogger, IVideoMixer } from 'cgf.cameracontrol.main.core';
import { Factory } from 'cgf.cameracontrol.main.core/GenericFactory/Factory';
import { EventEmitter } from 'events';
import { Fx10Builder } from './logitech/Fx10/Fx10Builder';

const logger: ILogger = {
    log(tolog: string) {
        console.log(tolog);
    },

    error(tolog: string) {
        console.error(tolog);
    },
};

class DummyMixerBuilder implements IBuilder<IVideoMixer> {
    Types = ['dummy'];
    build(_config: IConfig): IVideoMixer | undefined {
        return {
            imageSelectionChangeGet(_meNumber: number) {
                return new EventEmitter();
            },
            pan(meNumber: number, value: number) {
                logger.log(`pan:${meNumber},${value}`);
            },
            tilt(meNumber: number, value: number) {
                logger.log(`tilt:${meNumber},${value}`);
            },
            zoom(meNumber: number, value: number) {
                logger.log(`zoom:${meNumber},${value}`);
            },
            focus(meNumber: number, value: number) {
                logger.log(`focus:${meNumber},${value}`);
            },
            cut(meNumber: number) {
                logger.log(`cut:${meNumber}`);
            },
            auto(meNumber: number) {
                logger.log(`auto:${meNumber}`);
            },
            changeInput(meNumber: number, newInput: number) {
                logger.log(`changeInput:${meNumber},${newInput}`);
            },
            toggleKey(meNumber: number, key: number) {
                logger.log(`toggleKey:${meNumber},${key}`);
            },
            runMacro(macro: number) {
                logger.log(`macro:${macro}`);
            },
            connectionString: 'dummy',

            subscribe(_i: IConnection) {},
            unsubscribe(_i: IConnection) {},
            dispose() {},
        };
    }
}

const mixerFactory = new Factory<IVideoMixer>();
mixerFactory.builderAdd(new DummyMixerBuilder());
mixerFactory.parseConfig({ type: 'dummy', instance: 1 });

const logitechBuilder = new Fx10Builder(logger, mixerFactory);

var config = {
    type: 'logitech/F310',
    instance: 1,
    VideoMixer: { Connection: 1, MixBlock: 1 },
    ConnectionChange: {
        Default: { up: 2, down: 1, left: 12, right: 23 },
    },
    SpecialFunction: {
        Default: { X: { Type: 'key', Index: 1 }, Y: { Type: 'macro', Index: 1 } },
    },
};

logitechBuilder.build(config);
