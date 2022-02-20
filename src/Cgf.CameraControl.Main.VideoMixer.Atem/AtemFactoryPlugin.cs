using System.Text.Json;
using Cgf.CameraControl.Main.AtemConnection;
using Cgf.CameraControl.Main.Core;
using Cgf.CameraControl.Main.Core.Extensions;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.Logging;
using Cgf.CameraControl.Main.Core.VideoMixer;

namespace Cgf.CameraControl.Main.VideoMixer.BlackmagicDesign.Atem;

public class AtemFactoryPlugin : IFactoryPlugin<IVideoMixer>
{
    private readonly AtemFactory _atemFactory;
    private readonly string _atemIdentifier = "blackmagicdesign/atem";
    private readonly ILogger _logger;

    public AtemFactoryPlugin(ILogger logger, AtemFactory atemFactory)
    {
        _logger = logger;
        _atemFactory = atemFactory;
    }

    public IAsyncEnumerable<string> GetSupportedTypeIdentifiers() => new[]
    {
        _atemIdentifier
    }.AsAsyncEnumerable();

    public ValueTask<IVideoMixer> Create(JsonElement configuration, string supportedTypeIdentifier)
    {
        Configuration config;
        try
        {
            config = configuration.Deserialize<Configuration>();
        }
        catch (JsonException e)
        {
            throw new ConfigurationException(
                $"{configuration} is not a valid configuration for {_atemIdentifier}", e);
        }

        return ValueTask.FromResult<IVideoMixer>(new AtemImplementation(config, _logger, _atemFactory));
    }
}
