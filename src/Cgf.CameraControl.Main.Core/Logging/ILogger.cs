namespace Cgf.CameraControl.Main.Core.Logging;

public interface ILogger
{
    void Log(string moduleIdentifier, string message, LogLevel level);
    void Log(Exception e, string moduleIdentifier, string message, LogLevel level);
}