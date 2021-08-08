import * as signalR from '@microsoft/signalr';

import axios, { AxiosInstance } from 'axios';

import { CgfPtzCameraState } from './CgfPtzCameraState';
import { EventEmitter } from 'events';
import { Agent as HttpsAgent } from 'https';
import { ICameraConnection } from '../ICameraConnection';
import { ICgfPtzCameraConfiguration } from './ICgfPtzCameraConfiguration';
import { IConnection } from '../../GenericFactory/IConnection';
import { ILogger } from '../../Logger/ILogger';
import StrictEventEmitter from 'strict-event-emitter-types';

export class CgfPtzCamera implements ICameraConnection {
    private readonly axios: AxiosInstance;
    private readonly socketConnection: signalR.HubConnection;
    private readonly currentState = new CgfPtzCameraState();
    private shouldTransmitState = false;
    private canTransmit = false;

    public get connectionString(): string {
        return this.config.connectionUrl;
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

    constructor(private config: ICgfPtzCameraConfiguration, private logger: ILogger) {
        this.axios = axios.create({
            httpsAgent: new HttpsAgent({
                rejectUnauthorized: false,
            }),
        });

        this.socketConnection = new signalR.HubConnectionBuilder()
            .withAutomaticReconnect()
            .withUrl(`${this.config.connectionUrl}/pantiltzoom/state`)
            .build();

        this.initialConnect().catch((error) => this.logError(`Initial connection error:${error}`));
    }

    public async dispose(): Promise<void> {
        try {
            await this.socketConnection.stop();
        } catch (error) {
            this.logError(`unable to stop socket connection - ${error}`);
        }
    }

    public subscribe(i: IConnection): void {
        this._connectionEmitter.on('change', i.change);
        i.change(this.connected);
    }

    public unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    public pan(value: number): void {
        this.currentState.pan = value;
        this.scheduleStateTransmission();
    }
    public tilt(value: number): void {
        this.currentState.tilt = value;
        this.scheduleStateTransmission();
    }
    public zoom(value: number): void {
        this.currentState.zoom = value;
        this.scheduleStateTransmission();
    }
    public focus(value: number): void {
        this.currentState.focus = value;
        this.scheduleStateTransmission();
    }

    private async socketReconnected() {
        await this.setupRemote();
        await this.connectionSuccessfullyEstablished();
    }

    private async initialConnect() {
        await this.setupRemote();
        this.socketConnection.onreconnected(() => {
            this.log('reconnect successful');
            this.socketReconnected();
        });
        this.socketConnection.onreconnecting(() => {
            this.log('connection error - trying automatic reconnect');
            this.connected = false;
        });
        try {
            await this.socketConnection.start();
            await this.connectionSuccessfullyEstablished();
        } catch (error) {
            this.logError(`Socket connection setup failed with error:${error} - retrying`);
            await this.initialConnect();
        }
    }

    private async setupRemote() {
        try {
            const response = await this.axios.get(this.config.connectionUrl + '/connections');

            if (!response.data.includes(this.config.connectionPort)) {
                this.logError(`Port:${this.config.connectionPort} is not available. Available Ports:${response.data}`);
                this.logError('Stopping camera.');
                this.dispose();
            }
        } catch (error) {
            this.log(`Failed to connect - ${error}`);
            await this.setupRemote();
            return;
        }
        const connection = {
            connectionName: this.config.connectionPort,
            connected: true,
        };
        try {
            await this.axios.put(`${this.config.connectionUrl}/connection`, connection);
        } catch (error) {
            this.logError(`Failed to connect to Port:${this.config.connectionPort} with error:${error}`);
            this.logError('Stopping camera.');
            this.dispose();
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
                    this.log('state update failure returned - retrying');
                    this.shouldTransmitState = true;
                }
                this.canTransmit = true;
            } catch (error) {
                this.shouldTransmitState = true;
                this.log(`state transmission error - ${error}`);
            }
            await this.transmitNextStateIfRequestedAndPossible();
        }
    }

    private scheduleStateTransmission() {
        this.shouldTransmitState = true;
        this.transmitNextStateIfRequestedAndPossible();
    }

    private log(toLog: string) {
        this.logger.log(`PtzLancCamera(${this.config.connectionUrl}):${toLog}`);
    }

    private logError(toLog: string) {
        this.logger.error(`PtzLancCamera(${this.config.connectionUrl}):${toLog}`);
    }
}
