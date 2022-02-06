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
                throw new PluggableFactoryException($"Failed to create type {concreteType} from :\n{document}", e);
            }
        }

        throw new PluggableFactoryException($"Could not find plugin for type {concreteType}");
    }

    private static string ReadTypeIdentifier(JsonDocument document)
    {
        if (document.RootElement.TryGetProperty(TypeIdentifier, out var typeProperty))
        {
            var typePropertyAsString = typeProperty.GetString();
            if (typePropertyAsString == null)
            {
                throw new PluggableFactoryException("Failed to read type property");
            }

            return typePropertyAsString;
        }

        throw new PluggableFactoryException("Type property not found");
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