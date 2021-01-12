export interface ICameraConnection {
    pan(value: number): void;
    tilt(value: number): void;
    zoom(value: number): void;
    focus(value: number): void;
}
