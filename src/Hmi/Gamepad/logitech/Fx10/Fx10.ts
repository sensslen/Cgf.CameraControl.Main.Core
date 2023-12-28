import { CameraConnectionFactory, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConfig as IGamepadConfig, NodeGamepad, ILogger as NodeGamepadLogger } from '@sensslen/node-gamepad';

import { EButtonDirection } from '../../Shared/IGamepadConfiguration';
import { ILogitechFx10Config } from './ILogitechFx10Config';
import { LogitechGamepad } from '../LogitechGamepad';

export class Fx10 extends LogitechGamepad {
    private readonly pad: NodeGamepad;

    constructor(
        config: ILogitechFx10Config,
        logger: ILogger,
        mixerFactory: VideomixerFactory,
        cameraConnectionFactory: CameraConnectionFactory,
        gamepadConfig: IGamepadConfig
    ) {
        super(config, logger, mixerFactory, cameraConnectionFactory);
        if (config.serialNumber) {
            gamepadConfig.serialNumber = config.serialNumber;
        }

        const gamepadLogger: NodeGamepadLogger = {
            info: (tolog: string) => this.log(tolog),
        };

        this.pad = new NodeGamepad(gamepadConfig, gamepadLogger);

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

        this.pad.on('RB:press', () => {
            this.cut();
        });

        this.pad.on('RT:press', () => {
            this.auto();
        });

        this.pad.on('LB:press', () => {
            this.altKey(true);
        });

        this.pad.on('LB:release', () => {
            this.altKey(false);
        });

        this.pad.on('LT:press', () => {
            this.altLowerKey(true);
        });

        this.pad.on('LT:release', () => {
            this.altLowerKey(false);
        });

        this.pad.on('A:press', () => {
            this.specialFunction(EButtonDirection.down);
        });

        this.pad.on('B:press', () => {
            this.specialFunction(EButtonDirection.right);
        });

        this.pad.on('X:press', () => {
            this.specialFunction(EButtonDirection.left);
        });

        this.pad.on('Y:press', () => {
            this.specialFunction(EButtonDirection.up);
        });

        this.pad.start();
    }

    dispose(): Promise<void> {
        this.pad.stop();
        return Promise.resolve();
    }
}
