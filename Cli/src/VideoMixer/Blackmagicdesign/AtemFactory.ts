import { BehaviorSubject, Observable } from 'rxjs';

import { Atem } from 'atem-connection';
import { ILogger } from 'cgf.cameracontrol.main.core';

export interface IAtemConnection {
    readonly atem: Atem;
    readonly connected: boolean;
    readonly whenConnectionChanged: Observable<boolean>;
    startup(): Promise<void>;
}

class AtemConnection implements IAtemConnection {
    readonly atem: Atem;
    private startupResult: Promise<void> | undefined = undefined;
    private _connectionSubject = new BehaviorSubject<boolean>(false);

    constructor(
        private ip: string,
        private logger: ILogger
    ) {
        this.atem = new Atem();

        this.atem.on('connected', () => {
            this._connectionSubject.next(true);
        });
        this.atem.on('disconnected', () => {
            this._connectionSubject.next(false);
        });

        this.atem.on('error', (error) => this.error(error));
        this.atem.on('info', (log) => this.log(log));
    }

    get connected(): boolean {
        return this._connectionSubject.value;
    }

    public get whenConnectionChanged(): Observable<boolean> {
        return this._connectionSubject;
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
