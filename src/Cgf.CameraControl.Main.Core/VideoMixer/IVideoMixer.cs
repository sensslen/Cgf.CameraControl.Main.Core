using Cgf.CameraControl.Main.Core.Connection;

namespace Cgf.CameraControl.Main.Core.VideoMixer;

public interface IVideoMixer : IConnectionStateProvider, IAsyncDisposable
{
    /// <summary>
    ///     String identifying the connection to the video mixer
    /// </summary>
    string ConnectionString { get; }

    /// <summary>
    ///     Get all available image selections
    /// </summary>
    IAsyncEnumerable<VideoImageSelection> AvailableInputs { get; }

    /// <summary>
    ///     The cut command changes the image of the program and preview channels immediately
    /// </summary>
    void Cut();

    /// <summary>
    ///     The auto command changes the image of the program and preview channels immediately in a predefined time
    /// </summary>
    void Auto();

    /// <summary>
    ///     Change the image selected as the program output directly (do not change the image selected as preview)
    /// </summary>
    /// <param name="number">the numeric identifier of the video signal</param>
    void ChangeProgram(int number);

    /// <summary>
    ///     Change the image selected as the preview output (do not change the image selected as program)
    /// </summary>
    /// <param name="number">the numeric identifier of the video signal</param>
    void ChangePreview(int number);

    /// <summary>
    ///     Change the image selected as the auxiliary output
    /// </summary>
    /// <param name="aux">The numeric identifier of the auxiliary output</param>
    /// <param name="number">the numeric identifier of the video signal</param>
    void ChangeAuxiliary(int aux, int number);

    /// <summary>
    ///     Allows to check whether a key is currently set or not
    /// </summary>
    /// <param name="key">Numeric identifier of the key to check</param>
    /// <returns>Task that completes with the current setting of the key</returns>
    ValueTask<bool> IsKeySet(int key);

    /// <summary>
    ///     Subscribe to changes of the preview image selection
    ///     Note that an initial feedback can be expected upon registration.
    ///     Dispose the returned object in order to remove the subscription.
    /// </summary>
    /// <param name="selectionChanged">Callback function that notifies about the changed input</param>
    /// <returns>Disposable object that can be disposed to unsubscribe</returns>
    IDisposable SubscribePreviewChange(Action<VideoImageSelection> selectionChanged);

    /// <summary>
    ///     Subscribe to changes of the program image selection
    ///     Note that an initial feedback can be expected upon registration.
    ///     Dispose the returned object in order to remove the subscription.
    /// </summary>
    /// <param name="selectionChanged">Callback function that notifies about the changed input</param>
    /// <returns>Disposable object that can be disposed to unsubscribe</returns>
    IDisposable SubscribeProgramChange(Action<VideoImageSelection> selectionChanged);

    /// <summary>
    ///     Subscribe to changes of the auxiliary image selection
    ///     Note that an initial feedback can be expected upon registration.
    ///     Dispose the returned object in order to remove the subscription.
    /// </summary>
    /// <param name="aux">Numerical identifier of the auxiliary output</param>
    /// <param name="selectionChanged">Callback function that notifies about the changed input</param>
    /// <returns>Disposable object that can be disposed to unsubscribe</returns>
    IDisposable SubscribeAuxiliaryIndex(int aux, Action<VideoImageSelection, int> selectionChanged);
}
