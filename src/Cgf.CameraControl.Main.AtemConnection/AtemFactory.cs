using LibAtem.Net;

namespace Cgf.CameraControl.Main.AtemConnection;

public class AtemFactory
{
    private readonly Dictionary<string, AtemClient> connections = new();

    public AtemClient Get(string connectionString)
    {
        if (connections.TryGetValue(connectionString, out var connection))
        {
            return connection;
        }

        var newConnection = new AtemClient(connectionString);
        connections[connectionString] = newConnection;
        return newConnection;
    }
}
