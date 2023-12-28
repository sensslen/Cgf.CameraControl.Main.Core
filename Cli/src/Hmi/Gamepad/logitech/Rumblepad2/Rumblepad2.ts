import * as gamepadConfig from '@sensslen/node-gamepad/controllers/logitech/rumblepad2.json';

import { CameraConnectionFactory, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConfig as IGamepadConfig, NodeGamepad, ILogger as NodeGamepadLogger } from '@sensslen/node-gamepad';

import { EButtonDirection } from '../../Shared/IGamepadConfiguration';
import { IRumblepad2Config } from './IRumblepad2Config';
import { LogitechGamepad } from '../LogitechGamepad';

export class Rumblepad2 extends LogitechGamepad {
    private readonly pad: NodeGamepad;

    constructor(
        config: IRumblepad2Config,
        logger: ILogger,
        mixerFactory: VideomixerFactory,
        cameraConnectionFactory: CameraConnectionFactory
    ) {
        super(config, logger, mixerFactory, cameraConnectionFactory);
        const padConfig = gamepadConfig as IGamepadConfig;
        if (config.serialNumber) {
            padConfig.serialNumber = config.serialNumber;
        }

        const gamepadLogger: NodeGamepadLogger = {
            info: (tolog: string) => this.log(tolog),
        };

        this.pad = new NodeGamepad(padConfig, gamepadLogger);

        this.pad.on('left:move', (value) => {
            this.leftJoystickMove(value);
        });

        this.pad.on('right:move', (value) => {
            this.rightJoystickMove(value);
        });

        this.pad.on('dpadLeft:press', () => {
            this.changeConnection(EButtonDirection.left);
        });

        this.pad.on('dpadUp:press', () => {
            this.changeConnection(EButtonDirection.up);
        });

        this.pad.on('dpadRight:press', () => {
            this.changeConnection(EButtonDirection.right);
        });

        this.pad.on('dpadDown:press', () => {
            this.changeConnection(EButtonDirection.down);
        });

        this.pad.on('r1:press', () => {
            this.cut();
        });

        this.pad.on('r2:press', () => {
            this.auto();
        });

        this.pad.on('l1:press', () => {
            this.altKey(true);
        });

        this.pad.on('l1:release', () => {
            this.altKey(false);
        });

        this.pad.on('l2:press', () => {
            this.altLowerKey(true);
        });

        this.pad.on('l2:release', () => {
            this.altLowerKey(false);
        });

        this.pad.on('1:press', () => {
            this.specialFunction(EButtonDirection.left);
        });

        this.pad.on('2:press', () => {
            this.specialFunction(EButtonDirection.down);
        });

        this.pad.on('3:press', () => {
            this.specialFunction(EButtonDirection.right);
        });

        this.pad.on('4:press', () => {
            this.specialFunction(EButtonDirection.up);
        });

        this.pad.start();
    }

    dispose(): Promise<void> {
        this.pad.stop();
        return Promise.resolve();
    }
}
