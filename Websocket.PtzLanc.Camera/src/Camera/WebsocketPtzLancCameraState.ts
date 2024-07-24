class WebsocketPtzLancCameraState {
    pan = 0;
    tilt = 0;
    zoom = 0;
    red = 0;
    green = 0;
}

export class WebsocketPtzLancCameraPositionState extends WebsocketPtzLancCameraState {}

export class WebsocketPtzLancCameraSpeedState extends WebsocketPtzLancCameraState {}
