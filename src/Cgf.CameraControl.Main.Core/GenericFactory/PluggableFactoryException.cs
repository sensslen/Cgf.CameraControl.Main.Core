namespace Cgf.CameraControl.Main.Core.GenericFactory;

public class PluggableFactoryException : Exception
{
    public PluggableFactoryException(string message) : base(message)
    {
    }

    public PluggableFactoryException(string message, Exception inner) : base(message, inner)
    {
    }
}