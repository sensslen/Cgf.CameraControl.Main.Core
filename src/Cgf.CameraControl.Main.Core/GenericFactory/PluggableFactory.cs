using System.Text.Json;
using Cgf.CameraControl.Main.Core.Logging;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public class PluggableFactory<T> : WillLog
{
    private const string TypeIdentifier = "type";
    private readonly Dictionary<string, IFactoryPlugin<T>> _plugins;

    public PluggableFactory(Dictionary<string, IFactoryPlugin<T>> initialPlugins, ILogger logger,
        string? moduleIdentifier = null) : base(logger, moduleIdentifier ?? typeof(PluggableFactory<T>).FullName!)
    {
        _plugins = initialPlugins;
    }

    public async ValueTask<T> Create(JsonDocument document)
    {
        var concreteType = ReadTypeIdentifier(document);
        if (_plugins.TryGetValue(concreteType, out var plugin))
        {
            try
            {
                return await plugin.Create(document, concreteType);
            }
            catch (Exception e)
            {
                throw new PluggableFactoryException(
                    $"Failed to create type {concreteType} from: {JsonSerializer.Serialize(document)}", e);
            }
        }

        throw new PluggableFactoryException($"Could not find plugin for type {concreteType}");
    }

    private static string ReadTypeIdentifier(JsonDocument document)
    {
        if (document.RootElement.TryGetProperty(TypeIdentifier, out var typeProperty))
        {
            if (typeProperty.ValueKind == JsonValueKind.String)
            {
                return typeProperty.GetString()!;
            }

            throw new PluggableFactoryException(
                $"Type property must be a string. --{FormatJsonElement(typeProperty)}-- is not a string.");
        }

        throw new PluggableFactoryException("Type property not found");
    }

    protected static string FormatJsonElement(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Null:
                return "null";
            case JsonValueKind.Undefined:
                return "undefined";
            case JsonValueKind.String:
                return $"\"{element.ToString()}\"";
            default:
                return element.ToString();
        }
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
}