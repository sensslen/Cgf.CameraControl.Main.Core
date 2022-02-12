using System.Collections.Concurrent;
using System.Text.Json;
using Cgf.CameraControl.Main.Core.Extensions;
using Cgf.CameraControl.Main.Core.Logging;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public class PluggableInstanceManager<T> : PluggableFactory<T>, IPluggableInstanceManager<T> where T : IAsyncDisposable
{
    private const string InstanceNumberIdentifier = "instance";
    private readonly ConcurrentDictionary<int, T> _instances = new();

    public PluggableInstanceManager(ILogger logger) : base(new Dictionary<string, IFactoryPlugin<T>>(), logger,
        typeof(PluggableInstanceManager<T>).FullName)
    {
    }

    public async ValueTask DisposeAsync()
    {
        foreach (var instance in _instances)
        {
            await instance.Value.DisposeAsync();
        }

        _instances.Clear();
    }

    public T? Get(int instanceNumber) => _instances.TryGetValue(instanceNumber, out var instance) ? instance : default;

    public new async ValueTask Create(JsonElement config)
    {
        var instanceNumber = ReadInstanceNumber(config);
        var newInstance = await base.Create(config);

        var success = _instances.TryAdd(instanceNumber, newInstance);
        if (!success)
        {
            throw new ConfigurationException(
                $"There was already an instance created with number {instanceNumber}");
        }
    }

    private static int ReadInstanceNumber(JsonElement config)
    {
        if (config.TryGetProperty(InstanceNumberIdentifier, out var instanceNumberProperty))
        {
            if (instanceNumberProperty.ValueKind == JsonValueKind.Number &&
                instanceNumberProperty.TryGetInt32(out var instanceNumber))
            {
                return instanceNumber;
            }

            throw new ConfigurationException(
                $"Instance number property must be an integer. --{instanceNumberProperty.Format()}-- is not an integer.");
        }

        throw new ConfigurationException("Instance number property not found");
    }
}
