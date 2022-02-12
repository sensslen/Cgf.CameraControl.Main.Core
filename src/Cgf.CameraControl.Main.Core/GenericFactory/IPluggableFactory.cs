using System.Text.Json;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public interface IPluggableFactory<T>
{
    ValueTask<T> Create(JsonElement config);
    ValueTask RegisterPlugin(IFactoryPlugin<T> newPlugin);
}
