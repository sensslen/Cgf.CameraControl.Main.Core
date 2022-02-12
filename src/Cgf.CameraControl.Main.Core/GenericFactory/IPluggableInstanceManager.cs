using System.Text.Json;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public interface IPluggableInstanceManager<T> : IPluggableFactory<T>, IAsyncDisposable where T : IAsyncDisposable
{
    T? Get(int instanceNumber);

    new ValueTask Create(JsonElement config);
}
