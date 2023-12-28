export interface ILogger {
    log(toLog: string): void;
    error(toLog: string): void;
}
