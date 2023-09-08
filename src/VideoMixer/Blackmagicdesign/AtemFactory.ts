import { IConnection, ILogger, ISubscription } from 'cgf.cameracontrol.main.core';
import { Atem } from 'atem-connection';
import { EventEmitter } from 'events';
import { StrictEventEmitter } from 'strict-event-emitter-types';

class AtemConnectionmanager implements ISubscription<IConnection> {
    private readonly _connectionEmitter: StrictEventEmitter<EventEmitter, IConnection> = new EventEmitter();

    private _connected = false;

    constructor(atem: Atem) {
        atem.on('connected', () => {
            this.setConnected(true);
        });
        atem.on('disconnected', () => {
            this.setConnected(false);
        });
    }

    public get connected(): boolean {
        return this._connected;
    }

    subscribe(i: IConnection): void {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    }
    unsubscribe(i: IConnection): void {
        this._connectionEmitter.removeListener('change', i.change);
    }

    private setConnected(value: boolean) {
        this._connectionEmitter.emit('change', value);
        this._connected = value;
    }
}

export interface IAtemConnection {
    readonly atem: Atem;
    readonly connected: boolean;
    readonly connection: ISubscription<IConnection>;
    startup(): Promise<void>;
}

class AtemConnection implements IAtemConnection {
    readonly atem: Atem;
    readonly connection: AtemConnectionmanager;
    private startupResult: Promise<void> | undefined = undefined;

    constructor(
        private ip: string,
        private logger: ILogger
    ) {
        this.atem = new Atem();

        this.atem.on('error', (error) => this.error(error));
        this.atem.on('info', (log) => this.log(log));

        this.connection = new AtemConnectionmanager(this.atem);
    }
    get connected(): boolean {
        return this.connection.connected;
    }

    async startup(): Promise<void> {
        if (this.startupResult === undefined) {
            this.startupResult = this.atem.connect(this.ip);
        }
        return this.startupResult;
    }

    private error(e: string) {
        this.logger.error(`Atem-${this.ip}:${e}`);
    }
    private log(log: string) {
        this.logger.log(`Atem-${this.ip}:${log}`);
    }
}

export class AtemFactory {
    private connections = new Map<string, { connection: AtemConnection; usages: number }>();

    constructor(private logger: ILogger) {}

    get(ip: string): IAtemConnection {
        const requestedConnection = this.connections.get(ip);
        if (requestedConnection !== undefined) {
            requestedConnection.usages++;
            return requestedConnection.connection;
        }

        const retval = new AtemConnection(ip, this.logger);
        this.connections.set(ip, { connection: retval, usages: 1 });
        return retval;
    }

    release(ip: string): Promise<void> {
        const requestedConnection = this.connections.get(ip);
        if (requestedConnection !== undefined) {
            requestedConnection.usages--;
            if (requestedConnection.usages <= 0) {
                const retval = requestedConnection.connection.atem.disconnect();
                this.connections.delete(ip);
                return retval;
            }
        }

        return Promise.resolve();
    }
}
