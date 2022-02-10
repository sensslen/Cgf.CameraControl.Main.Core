namespace Cgf.CameraControl.Main.Core.Connection;

public interface IConnectionStateProvider
{
    /// <summary>
    ///     Subscribe to changes of the connection state
    ///     Note that an initial feedback can be expected upon registration.
    ///     Dispose the returned object in order to remove the subscription.
    /// </summary>
    /// <param name="onChange">Callback function that notifies connection state changes</param>
    /// <returns>Disposable object that can be disposed to unsubscribe</returns>
    IDisposable SubscribeConnectionState(Action<bool> onChange);
}
