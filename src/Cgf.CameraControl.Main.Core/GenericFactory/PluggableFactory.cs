using System.Text.Json;
using Cgf.CameraControl.Main.Core.Extensions;
using Cgf.CameraControl.Main.Core.Logging;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public class PluggableFactory<T> : WillLog, IPluggableFactory<T>
{
    private const string TypeIdentifier = "type";
    private readonly Dictionary<string, IFactoryPlugin<T>> _plugins;

    public PluggableFactory(Dictionary<string, IFactoryPlugin<T>> initialPlugins, ILogger logger,
        string? moduleIdentifier = null) : base(logger, moduleIdentifier ?? typeof(PluggableFactory<T>).FullName!)
    {
        _plugins = initialPlugins;
    }

    public async ValueTask<T> Create(JsonElement config)
    {
        var concreteType = ReadTypeIdentifier(config);
        if (_plugins.TryGetValue(concreteType, out var plugin))
        {
            try
            {
                return await plugin.Create(config, concreteType);
            }
            catch (Exception e)
            {
                throw new ConfigurationException(
                    $"Failed to create type {concreteType} from: {JsonSerializer.Serialize(config)}", e);
            }
        }

        throw new ConfigurationException($"Could not find plugin for type {concreteType}");
    }

    public async ValueTask RegisterPlugin(IFactoryPlugin<T> newPlugin)
    {
        await foreach (var type in newPlugin.GetSupportedTypeIdentifiers())
        {
            lock (_plugins)
            {
                if (!_plugins.ContainsKey(type))
                {
                    _plugins[type] = newPlugin;
                }
                else
                {
                    Log($"Already a factory plugin registered that creates {type}. Doing nothing.", LogLevel.Warning);
                }
            }
        }
    }

    private static string ReadTypeIdentifier(JsonElement config)
    {
        if (config.TryGetProperty(TypeIdentifier, out var typeProperty))
        {
            if (typeProperty.ValueKind == JsonValueKind.String)
            {
                return typeProperty.GetString()!;
            }

            throw new ConfigurationException(
                $"Type property must be a string. --{typeProperty.Format()}-- is not a string.");
        }

        throw new ConfigurationException("Type property not found");
    }
}
