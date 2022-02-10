namespace Cgf.CameraControl.Main.Core.Logging;

public class WillLog
{
    private readonly ILogger _logger;
    private readonly string _moduleIdentifier;

    public WillLog(ILogger logger, string moduleIdentifier)
    {
        _logger = logger;
        _moduleIdentifier = moduleIdentifier;
    }

    public void Log(string message, LogLevel level)
    {
        _logger.Log(_moduleIdentifier, message, level);
    }

    public void Log(Exception e, string moduleIdentifier, string message, LogLevel level)
    {
        _logger.Log(e, _moduleIdentifier, message, level);
    }
}
