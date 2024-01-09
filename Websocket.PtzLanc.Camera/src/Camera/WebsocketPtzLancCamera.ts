import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { ICameraConnection } from 'cgf.cameracontrol.main.core';
import { ILogger } from 'cgf.cameracontrol.main.core';
import { IWebsocketPtzLancCameraConfiguration } from './IWebsocketPtzLancCameraConfiguration';
import { WebSocket } from 'partysocket';
import { WebsocketPtzLancCameraSpeedState } from './WebsocketPtzLancCameraState';

export class WebsocketPtzLancCamera implements ICameraConnection {
    private _websocket: WebSocket;
    private readonly stateSubject = new BehaviorSubject<WebsocketPtzLancCameraSpeedState>(
        new WebsocketPtzLancCameraSpeedState()
    );
    private readonly connectionSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private readonly transmitSubscription: Subscription;

    constructor(
        private config: IWebsocketPtzLancCameraConfiguration,
        private logger: ILogger
    ) {
        const connectionId = `ws://${this.config.connectionUrl}:${this.config.connectionPort}`;
        this._websocket = new WebSocket(connectionId);

        this._websocket.onopen = (_) => {
            this.log(`websocket connected: ${connectionId}`);
            this.connectionSubject.next(true);
        };

        this._websocket.onerror = (errorevent) => {
            this.log(`websocket error on connection: ${connectionId}\n${errorevent.message}\n${errorevent.error}`);
        };

        this._websocket.onclose = (closeevent) => {
            this.log(
                `websocket closed - trying automatic reconnect: ${connectionId}\n${closeevent.code}-${closeevent.reason}`
            );
            this.connectionSubject.next(false);
        };

        this.transmitSubscription = combineLatest([this.connectionSubject, this.stateSubject]).subscribe(
            ([isConnected, state]) => {
                if (isConnected) {
                    this._websocket.send(JSON.stringify(state));
                }
            }
        );
    }

    public get connectionString(): string {
        return this.config.connectionUrl;
    }

    public get whenConnectionChanged(): Observable<boolean> {
        return this.connectionSubject;
    }

    public async dispose(): Promise<void> {
        try {
            this.transmitSubscription.unsubscribe();
            this._websocket.close();
        } catch (error) {
            this.logError(`unable to stop socket connection - ${error}`);
        }
    }

    public pan(value: number): void {
        this.setState((state) => {
            state.pan = this.multiplyRoundAndCrop(value * 255, 255);
            return state;
        });
    }
    public tilt(value: number): void {
        this.setState((state) => {
            state.tilt = this.multiplyRoundAndCrop(value * 255, 255);
            return state;
        });
    }
    public zoom(value: number): void {
        this.setState((state) => {
            state.zoom = this.multiplyRoundAndCrop(value * 8, 8);
            return state;
        });
    }
    public focus(value: number): void {
        this.setState((state) => {
            state.focus = this.multiplyRoundAndCrop(value * 1.2, 1);
            return state;
        });
    }

    private setState(change: (state: WebsocketPtzLancCameraSpeedState) => WebsocketPtzLancCameraSpeedState): void {
        const newState = change(this.stateSubject.value);
        this.stateSubject.next(newState);
    }

    private log(toLog: string) {
        this.logger.log(`CgfPtzCamera(${this.config.connectionUrl}):${toLog}`);
    }

    private logError(toLog: string) {
        this.logger.error(`CgfPtzCamera(${this.config.connectionUrl}):${toLog}`);
    }
    private multiplyRoundAndCrop(value: number, maximumAbsolute: number): number {
        const maximized = Math.max(-maximumAbsolute, Math.min(maximumAbsolute, value));
        return Math.round(maximized);
    }
}
