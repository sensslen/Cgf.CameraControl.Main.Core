import { CameraConnectionFactory, ILogger, VideomixerFactory } from 'cgf.cameracontrol.main.core';
import { IConfig as IGamepadConfig, NodeGamepad, ILogger as NodeGamepadLogger } from '@sensslen/node-gamepad';

import { EButtonDirection } from '../../Shared/IGamepadConfiguration';
import { Gamepad } from '../../Shared/Gampepad';
import { ILogitechFx10Config } from './ILogitechFx10Config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const interpolate = require('everpolate').linear;

export class Fx10 extends Gamepad {
    private readonly pad: NodeGamepad;
    private readonly moveInterpolation: number[][] = [
        [0, 63, 95, 127, 128, 160, 192, 255],
        [1, 0.27, 0.08, 0, 0, -0.08, -0.27, -1],
    ];
    private readonly zoomFocusInterpolation: number[][] = [
        [0, 127, 128, 255],
        [-1, 0, 0, 1],
    ];

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
            this.pan(interpolate(value.x, this.moveInterpolation[0], this.moveInterpolation[1])[0]);
            this.tilt(interpolate(value.y, this.moveInterpolation[0], this.moveInterpolation[1])[0]);
        });

        this.pad.on('right:move', (value) => {
            this.zoom(interpolate(value.x, this.zoomFocusInterpolation[0], this.zoomFocusInterpolation[1])[0]);
            this.focus(interpolate(value.y, this.zoomFocusInterpolation[0], this.zoomFocusInterpolation[1])[0]);
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
