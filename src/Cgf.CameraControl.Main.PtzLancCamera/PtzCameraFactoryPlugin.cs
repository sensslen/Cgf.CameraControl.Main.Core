using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Cgf.CameraControl.Main.Core;
using Cgf.CameraControl.Main.Core.Camera;
using Cgf.CameraControl.Main.Core.Extensions;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.Logging;

namespace Cgf.CameraControl.Main.Camera.Cgf.PtzLanc;

public class PtzCameraFactoryPlugin : IFactoryPlugin<ICamera>
{
    private readonly ILogger _logger;
    private readonly string _ptzCameraIdentifier = "Cgf.PtzCamera";

    public PtzCameraFactoryPlugin(ILogger logger)
    {
        _logger = logger;
    }

    public IAsyncEnumerable<string> GetSupportedTypeIdentifiers() => new[]
    {
        _ptzCameraIdentifier
    }.AsAsyncEnumerable();

    public ValueTask<ICamera> Create(JsonElement configuration, string supportedTypeIdentifier)
    {
        Configuration config;
        try
        {
            config = configuration.Deserialize<Configuration>();
        }
        catch (JsonException e)
        {
            throw new ConfigurationException(
                $"{configuration} is not a valid configuration for {_ptzCameraIdentifier}", e);
        }

        return ValueTask.FromResult<ICamera>(new CameraImplementation(config, _logger));
    }
}
