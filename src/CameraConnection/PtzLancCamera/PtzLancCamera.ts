import * as signalR from '@microsoft/signalr';

import axios, { AxiosInstance } from 'axios';

import { EventEmitter } from 'events';
import { Agent as HttpsAgent } from 'https';
import { ICameraConnection } from '../ICameraConnection';
import { IConnection } from '../../GenericFactory/IConnection';
import { ILogger } from '../../Logger/ILogger';
import { IPtzLancCameraConfiguration } from './IPtzLancCameraConfiguration';
import { PtzLancCameraState } from './PtzLancCameraState';
import StrictEventEmitter from 'strict-event-emitter-types';

export class PtzLancCamera implements ICameraConnection {
    private readonly axios: AxiosInstance;
    private socketConnection: signalR.HubConnection;
    private currentState = new PtzLancCameraState();
    private shouldTransmitState = false;
    private canTransmit = false;

    public get connectionString(): string {
        return this.config.ConnectionUrl;
    }

    private _connected = false;
    private _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();
    public get connected(): boolean {
        return this._connected;
    }
    public set connected(v: boolean) {
        this._connected = v;
        this._connectionEmitter.emit('change', v);
    }

    constructor(private config: IPtzLancCameraConfiguration, private logger: ILogger) {
        this.axios = axios.create({
            httpsAgent: new HttpsAgent({
                rejectUnauthorized: false,
            }),
        });

        this.socketConnection = new signalR.HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(this.config.ConnectionUrl + '/pantiltzoom/statehub')
            .build();

        this.initialConnect();
    }

    async dispose(): Promise<void> {
        try {
            await this.socketConnection.stop();
        } catch (error) {
            this.LogError(`unable to stop socket connection - ${error}`);
        }
    }

    private async socketReconnected() {
        await this.setupRemote();
        await this.connectionSuccessfullyEstablished();
    }

    private async initialConnect() {
        await this.setupRemote();
        this.socketConnection.onreconnected(() => {
            this.Log(`reconnect successful`);
            this.socketReconnected();
        });
        this.socketConnection.onreconnecting(() => {
            this.Log(`connection error - trying automatic reconnect`);
            this.connected = false;
        });
        try {
            await this.socketConnection.start();
            await this.connectionSuccessfullyEstablished();
        } catch (error) {
            this.LogError(`Socket connection setup failed - ${error}`);
            await this.initialConnect();
        }
    }

    private async setupRemote() {
        try {
            const response = await this.axios.get(this.config.ConnectionUrl + '/pantiltzoom/connections');

            if (!response.data.includes(this.config.ConnectionPort)) {
                this.LogError(`Port: ${this.config.ConnectionPort} is not available. Available Ports:${response.data}`);
                process.exit();
            }
            const connection = {
                connectionName: this.config.ConnectionPort,
                connected: true,
            };
            try {
                await this.axios.put(this.config.ConnectionUrl + '/pantiltzoom/connection', connection);
            } catch (error) {
                this.LogError(`Failed to connect to Port: ${this.config.ConnectionPort} with error:${error}`);
                process.exit();
            }
        } catch (error) {
            this.Log(`Failed to connect - ${error}`);
            await this.setupRemote();
        }
    }

    private async connectionSuccessfullyEstablished() {
        this.canTransmit = true;
        this.connected = true;
        await this.transmitNextStateIfRequestedAndPossible();
    }

    private async transmitNextStateIfRequestedAndPossible() {
        if (!this.canTransmit) {
            return;
        }
        if (!this.connected) {
            return;
        }
        if (this.shouldTransmitState) {
            this.canTransmit = false;
            this.shouldTransmitState = false;
            try {
                const updateSuccessful = await this.socketConnection.invoke('SetState', this.currentState);
                if (!updateSuccessful) {
                    this.Log('state update failure returned - retrying');
                    this.shouldTransmitState = true;
                }
                this.canTransmit = true;
            } catch (error) {
                this.shouldTransmitState = true;
                this.Log(`state transmission error - ${error}`);
            }
            await this.transmitNextStateIfRequestedAndPossible();
        }
    }

    subscribe(i: IConnection): void {
        this._connectionEmitter.on('change', i.change);
        i.change(this.connected);
    }

    unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    pan(value: number): void {
        this.currentState.pan = this.roundAndRestrictRange(value, 255);
        this.ScheduleStateTransmission();
    }
    tilt(value: number): void {
        this.currentState.tilt = this.roundAndRestrictRange(value, 255);
        this.ScheduleStateTransmission();
    }
    zoom(value: number): void {
        this.currentState.zoom = this.roundAndRestrictRange(value, 8);
        this.ScheduleStateTransmission();
    }
    focus(value: number): void {
        this.currentState.focus = this.roundAndRestrictRange(value, 1.2);
        this.ScheduleStateTransmission();
    }

    private ScheduleStateTransmission() {
        this.shouldTransmitState = true;
        this.transmitNextStateIfRequestedAndPossible();
    }

    private roundAndRestrictRange(value: number, maxMin: number) {
        const restricted = Math.min(Math.max(value, maxMin), -maxMin);
        return Math.round(restricted);
    }

    private Log(toLog: string) {
        this.logger.log(`PtzLancCamera(${this.config.ConnectionUrl}):${toLog}`);
    }

    private LogError(toLog: string) {
        this.logger.error(`PtzLancCamera(${this.config.ConnectionUrl}):${toLog}`);
    }
}
