using Cgf.CameraControl.Main.Core.Connection;

namespace Cgf.CameraControl.Main.Core.HMI;

public interface IHmi : IAsyncDisposable, IObservable<ConnectionState>
{
}
