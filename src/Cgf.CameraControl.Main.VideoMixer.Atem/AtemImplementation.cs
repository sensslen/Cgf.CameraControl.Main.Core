using System.Reactive.Subjects;
using Cgf.CameraControl.Main.AtemConnection;
using Cgf.CameraControl.Main.Core.Connection;
using Cgf.CameraControl.Main.Core.Logging;
using Cgf.CameraControl.Main.Core.VideoMixer;
using LibAtem.Net;

namespace Cgf.CameraControl.Main.VideoMixer.BlackmagicDesign.Atem;

public class AtemImplementation : WillLog, IVideoMixer
{
    private readonly AtemClient _atemConnection;
    private readonly Configuration _config;
    private readonly BehaviorSubject<ConnectionState> _connectionStateSubject = new(ConnectionState.NotConnected);

    public AtemImplementation(Configuration config, ILogger logger, AtemFactory atemFactory) : base(logger,
        typeof(AtemImplementation).FullName!)
    {
        _atemConnection = atemFactory.Get(config.Ip);
        _config = config;
    }

    public string ConnectionString => throw new NotImplementedException();

    public IAsyncEnumerable<VideoImageSelection> AvailableInputs => throw new NotImplementedException();

    public ValueTask DisposeAsync() => throw new NotImplementedException();

    public void Cut()
    {
        throw new NotImplementedException();
    }

    public void Auto()
    {
        throw new NotImplementedException();
    }

    public void ChangeProgram(int number)
    {
        throw new NotImplementedException();
    }

    public void ChangePreview(int number)
    {
        throw new NotImplementedException();
    }

    public void ChangeAuxiliary(int aux, int number)
    {
        throw new NotImplementedException();
    }

    public ValueTask<bool> IsKeySet(int key) => throw new NotImplementedException();

    public IDisposable SubscribePreviewChange(Action<VideoImageSelection> selectionChanged) =>
        throw new NotImplementedException();

    public IDisposable SubscribeProgramChange(Action<VideoImageSelection> selectionChanged) =>
        throw new NotImplementedException();

    public IDisposable SubscribeAuxiliaryIndex(int aux, Action<VideoImageSelection, int> selectionChanged) =>
        throw new NotImplementedException();

    public IDisposable Subscribe(IObserver<ConnectionState> observer) => throw new NotImplementedException();
}
