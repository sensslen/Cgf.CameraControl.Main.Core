namespace Cgf.CameraControl.Main.Core.Test.GenericFactory;

internal interface ITestAsyncDisposable : IAsyncDisposable
{
    bool Disposed { get; }
}
