using System.Text.Json;
using Cgf.CameraControl.Main.Core.Camera;
using Cgf.CameraControl.Main.Core.Extensions;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.HMI;
using Cgf.CameraControl.Main.Core.Logging;
using Cgf.CameraControl.Main.Core.VideoMixer;

namespace Cgf.CameraControl.Main.Core;

public class Core : IAsyncDisposable
{
    private const string CameraIdentifier = "cams";

    private const string VideoMixerIdentifier = "videoMixers";

    private const string HmiIdentifier = "interfaces";

    public Core(ILogger logger)
    {
        CameraInstanceManager = new PluggableInstanceManager<ICamera>(logger);
        VideoMixerInstanceManager = new PluggableInstanceManager<IVideoMixer>(logger);
        HmiInstanceManager = new PluggableInstanceManager<IHmi>(logger);
    }

    public PluggableInstanceManager<ICamera> CameraInstanceManager { get; }
    public PluggableInstanceManager<IVideoMixer> VideoMixerInstanceManager { get; }
    public PluggableInstanceManager<IHmi> HmiInstanceManager { get; }

    public async ValueTask DisposeAsync()
    {
        await HmiInstanceManager.DisposeAsync();
        await VideoMixerInstanceManager.DisposeAsync();
        await CameraInstanceManager.DisposeAsync();
    }

    public async ValueTask Bootstrap(JsonDocument configuration)
    {
        var cameraConfigurations = GetConfigurations(configuration, CameraIdentifier);
        var videoMixerConfigurations = GetConfigurations(configuration, VideoMixerIdentifier);
        var hmiConfigurations = GetConfigurations(configuration, HmiIdentifier);
        foreach (var camConfig in cameraConfigurations)
        {
            await CameraInstanceManager.Create(camConfig);
        }

        foreach (var mixerConfig in videoMixerConfigurations)
        {
            await VideoMixerInstanceManager.Create(mixerConfig);
        }

        foreach (var hmiConfig in hmiConfigurations)
        {
            await VideoMixerInstanceManager.Create(hmiConfig);
        }
    }

    private IEnumerable<JsonElement> GetConfigurations(JsonDocument configuration, string identifier)
    {
        if (configuration.RootElement.TryGetProperty(identifier, out var property))
        {
            if (property.ValueKind == JsonValueKind.Array)
            {
                return property.EnumerateArray();
            }

            throw new ConfigurationException(
                $"The {identifier} property must be an array. --{property.Format()}-- is not an array.");
        }

        throw new ConfigurationException($"Property {identifier} not found");
    }
}
