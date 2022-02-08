using System.Text.Json;
using Cgf.CameraControl.Main.Core.Logging;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public class PluggableInstanceManager<T> : PluggableFactory<T>, IDisposable where T : IDisposable
{
    private const string InstanceNumberIdentifier = "instance";
    private readonly Dictionary<int, T> _instances = new();

    public PluggableInstanceManager(ILogger logger) : base(new Dictionary<string, IFactoryPlugin<T>>(), logger,
        typeof(PluggableInstanceManager<T>).FullName)
    {
    }

    public void Dispose()
    {
        foreach (var instance in _instances)
        {
            instance.Value.Dispose();
        }

        _instances.Clear();
    }

    public T? Get(int instanceNumber)
    {
        lock (_instances)
        {
            return _instances.TryGetValue(instanceNumber, out var instance) ? instance : default;
        }
    }

    public new async ValueTask Create(JsonDocument document)
    {
        var instanceNumber = ReadInstanceNumber(document);
        var newInstance = await base.Create(document);
        lock (_instances)
        {
            if (_instances.ContainsKey(instanceNumber))
            {
                throw new PluggableFactoryException(
                    $"There was already an instance created with number {instanceNumber}");
            }

            _instances[instanceNumber] = newInstance;
        }
    }

    private static int ReadInstanceNumber(JsonDocument document)
    {
        if (document.RootElement.TryGetProperty(InstanceNumberIdentifier, out var instanceNumberProperty))
        {
            if (instanceNumberProperty.ValueKind == JsonValueKind.Number &&
                instanceNumberProperty.TryGetInt32(out var instanceNumber))
            {
                return instanceNumber;
            }

            throw new PluggableFactoryException(
                $"Instance number property must be an integer. --{FormatJsonElement(instanceNumberProperty)}-- is not an integer.");
        }

        throw new PluggableFactoryException("Instance number property not found");
    }
}