using Cgf.CameraControl.Main.Core.Connection;

namespace Cgf.CameraControl.Main.Core.Camera;

public interface ICamera : IConnectionStateProvider, IAsyncDisposable
{
    /// <summary>
    ///     String identifying the camera connection
    /// </summary>
    string ConnectionString { get; }

    /// <summary>
    ///     Set the pan speed of the camera.
    /// </summary>
    /// <param name="value">
    ///     The speed of pan in the value range of [-1 .. 1] where -1 represents maximum speed left and 1
    ///     represents maximum speed right
    /// </param>
    void Pan(double value);

    /// <summary>
    ///     Set the tilt speed of the camera.
    /// </summary>
    /// <param name="value">
    ///     The speed of tilt in the value range of [-1 .. 1] where -1 represents maximum speed down and 1
    ///     represents maximum speed up
    /// </param>
    void Tilt(double value);

    /// <summary>
    ///     Set the zoom speed of the camera.
    /// </summary>
    /// <param name="value">
    ///     The speed of zoom in the value range of [-1 .. 1] where -1 represents maximum speed out and 1
    ///     represents maximum speed in
    /// </param>
    void Zoom(double value);

    /// <summary>
    ///     Set the focus speed of the camera.
    /// </summary>
    /// <param name="value">
    ///     The speed of zoom in the value range of [-1 .. 1] where -1 represents maximum speed out and 1
    ///     represents maximum speed in
    /// </param>
    void Focus(double value);
}
