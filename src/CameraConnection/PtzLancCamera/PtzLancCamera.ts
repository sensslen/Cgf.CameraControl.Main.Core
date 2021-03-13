import axios, { AxiosInstance } from 'axios';
import { Agent as HttpsAgent } from 'https';
import * as signalR from '@microsoft/signalr';
import StrictEventEmitter from 'strict-event-emitter-types';
import { EventEmitter } from 'events';

import { ILogger } from '../../Logger/ILogger';
import { ICameraConnection } from '../ICameraConnection';
import { IPtzLancCameraConfiguration } from './IPtzLancCameraConfiguration';
import { PtzLancCameraState } from './PtzLancCameraState';
import { IConnection } from '../../GenericFactory/IConnection';

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
        this.config = this.config;
        this.logger = this.logger;

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

    dispose(): void {
        this.socketConnection.stop();
    }

    private initialConnect() {
        this.setupRemote(() => {
            this.socketConnection.onreconnected(() => {
                this.logger.log(`reconnect successful (${this.config.ConnectionUrl})`);
                this.setupRemote(() => {
                    this.connectionSuccessfullyEstablished();
                });
            });
            this.socketConnection.onreconnecting(() => {
                this.logger.log(`connection error (${this.config.ConnectionUrl}) - trying automatic reconnect`);
                this.connected = false;
            });
            this.socketConnection
                .start()
                .then(() => {
                    this.connectionSuccessfullyEstablished();
                })
                .catch((error) => {
                    this.logger.log('Socket connection setup failed.');
                    this.logger.log('error:' + error);
                    this.initialConnect();
                });
        });
    }

    private setupRemote(onComplete: () => void) {
        this.axios
            .get(this.config.ConnectionUrl + '/pantiltzoom/connections')
            .then((response) => {
                if (!response.data.includes(this.config.ConnectionPort)) {
                    this.logger.log('Port:' + this.config.ConnectionPort + ' is not available.');
                    this.logger.log('Available Ports:' + response.data);
                    process.exit();
                }
                let connection = {
                    connectionName: this.config.ConnectionPort,
                    connected: true,
                };
                this.axios
                    .put(this.config.ConnectionUrl + '/pantiltzoom/connection', connection)
                    .then(() => {
                        onComplete();
                    })
                    .catch((error) => {
                        this.logger.log('Failed to connect to Port:' + this.config.ConnectionPort);
                        this.logger.log('error:' + error);
                        process.exit();
                    });
            })
            .catch((error) => {
                this.logger.log('Failed to connect:' + this.config.ConnectionUrl);
                this.logger.log('error:' + error);
                this.setupRemote(onComplete);
            });
    }

    private connectionSuccessfullyEstablished() {
        this.canTransmit = true;
        this.connected = true;
        this.transmitNextStateIfRequestedAndPossible();
    }

    private transmitNextStateIfRequestedAndPossible() {
        if (!this.canTransmit) {
            return;
        }
        if (!this.connected) {
            return;
        }
        if (this.shouldTransmitState) {
            this.canTransmit = false;
            this.shouldTransmitState = false;
            this.socketConnection
                .invoke('SetState', this.currentState)
                .then((updateSuccessful: boolean) => {
                    if (!updateSuccessful) {
                        this.logger.log('state update failure returned - retrying');
                        this.shouldTransmitState = true;
                    }
                    this.canTransmit = true;
                    this.transmitNextStateIfRequestedAndPossible();
                })
                .catch((error) => {
                    this.shouldTransmitState = true;
                    this.logger.log('state transmission error:');
                    this.logger.log('error:' + error);
                });
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
}
