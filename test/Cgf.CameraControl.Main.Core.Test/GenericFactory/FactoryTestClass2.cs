namespace Cgf.CameraControl.Main.Core.Test.GenericFactory;

public record FactoryTestClass2(string Id) : ITestAsyncDisposable
{
    public ValueTask DisposeAsync()
    {
        Disposed = true;
        return ValueTask.CompletedTask;
    }

    public bool Disposed { get; private set; }
}
