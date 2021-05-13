import { IBuilder, IConfig, IConnection, ILogger, IVideoMixer } from 'cgf.cameracontrol.main.core';

import { EventEmitter } from 'events';
import { Factory } from 'cgf.cameracontrol.main.core/GenericFactory/Factory';
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
    supportedTypes(): Promise<string[]> {
        return Promise.resolve(['dummy']);
    }
    build(_config: IConfig): Promise<IVideoMixer> {
        return Promise.resolve({
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

            subscribe(_i: IConnection) {
                //empty on purpose
            },
            unsubscribe(_i: IConnection) {
                //empty on purpose
            },
            dispose() {
                return Promise.resolve();
            },
        });
    }
}

async function run() {
    const mixerFactory = new Factory<IVideoMixer>();
    await mixerFactory.builderAdd(new DummyMixerBuilder(), logger);
    await mixerFactory.parseConfig({ type: 'dummy', instance: 1 }, logger);

    const logitechBuilder = new Fx10Builder(logger, mixerFactory);

    const config = {
        type: 'logitech/F310',
        instance: 1,
        videoMixer: { connection: 1, mixBlock: 1 },
        connectionChange: {
            default: { up: 2, down: 1, left: 12, right: 23 },
        },
        specialFunction: {
            default: { x: { type: 'key', index: 1 }, y: { type: 'macro', index: 1 } },
        },
    };
    await logitechBuilder.build(config);
}

run();
