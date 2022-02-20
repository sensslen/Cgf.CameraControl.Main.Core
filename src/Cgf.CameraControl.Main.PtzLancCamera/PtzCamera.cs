using System;
using System.Collections.Generic;
using System.Linq;
using System.Reactive.Subjects;
using System.Threading;
using System.Threading.Tasks;
using Cgf.CameraControl.Main.Core.Camera;
using Cgf.CameraControl.Main.Core.Connection;
using Cgf.CameraControl.Main.Core.Logging;
using Microsoft.AspNetCore.SignalR.Client;

namespace Cgf.CameraControl.Main.Camera.Cgf.PtzLanc;

public class CameraImplementation : WillLog, ICamera
{
    private readonly CancellationTokenSource _cancellation = new();
    private readonly Task _communicationTask;
    private readonly Configuration _config;

    private readonly BehaviorSubject<ConnectionState> _connectionStateSubject = new(ConnectionState.NotConnected);
    private readonly HubConnection _stateConnection;

    // do transmit initial state
    private readonly AutoResetEvent _stateUpdateRequested = new(true);
    private State _currentState = new() { Pan = 0, Tilt = 0, Zoom = 0, Focus = 0 };

    public CameraImplementation(Configuration config, ILogger logger) : base(logger,
        typeof(CameraImplementation).FullName!)
    {
        _config = config;

        _stateConnection = new HubConnectionBuilder().WithAutomaticReconnect()
            .WithUrl($"{config.ConnectionUrl}/statehub")
            .Build();

        _stateConnection.Reconnecting += ConnectionLostStartingReconnect;
        _stateConnection.Reconnected += ConnectionReestablished;

        _communicationTask = CommunicationTask();
    }

    public async ValueTask DisposeAsync()
    {
        _cancellation.Cancel();
        await _communicationTask;
        await _stateConnection.DisposeAsync();
    }

    public string ConnectionString => _config.ConnectionUrl;

    public void Pan(double value)
    {
        _currentState.Pan = MultiplyRoundAndCrop(value * 255, 255);
        _stateUpdateRequested.Set();
    }

    public void Tilt(double value)
    {
        _currentState.Tilt = MultiplyRoundAndCrop(value * 255, 255);
        _stateUpdateRequested.Set();
    }

    public void Zoom(double value)
    {
        _currentState.Zoom = MultiplyRoundAndCrop(value * 8, 8);
        _stateUpdateRequested.Set();
    }

    public void Focus(double value)
    {
        _currentState.Focus = MultiplyRoundAndCrop(value * 1.2, 1);
        _stateUpdateRequested.Set();
    }

    public IDisposable Subscribe(IObserver<ConnectionState> observer) => _connectionStateSubject.Subscribe(observer);

    private async Task CommunicationTask()
    {
        await _stateConnection.StartAsync(_cancellation.Token);
        await Connect();
        while (!_cancellation.IsCancellationRequested)
        {
            await new Task(() => WaitHandle.WaitAny(new[] { _cancellation.Token.WaitHandle, _stateUpdateRequested }));
            var succeeded = await _stateConnection.InvokeAsync<bool>("SetState", _currentState, _cancellation.Token);
            if (!succeeded)
            {
                _stateUpdateRequested.Set();
            }
        }
    }

    private async Task ConnectionReestablished(string? _)
    {
        await Connect();
    }

    private Task ConnectionLostStartingReconnect(Exception? exception)
    {
        var logMessage = $"Connection to {_config.ConnectionUrl} lost, trying reconnect";
        if (exception == null)
        {
            Log(logMessage, LogLevel.Info);
        }
        else
        {
            Log(exception, logMessage, LogLevel.Info);
        }

        _connectionStateSubject.OnNext(ConnectionState.NotConnected);
        return Task.CompletedTask;
    }

    private async Task Connect()
    {
        while (true)
        {
            var connectionPorts =
                (await _stateConnection.InvokeAsync<IEnumerable<string>>("Connections", _cancellation.Token)).ToArray();
            if (connectionPorts.All(connection => _config.ConnectionPort.Equals(connection)))
            {
                Log(
                    $"Port:{_config.ConnectionPort} is not available.Available Ports:{string.Join(",", connectionPorts.Select(p => $"\"{p}\""))}",
                    LogLevel.Warning);

                continue;
            }

            var connection = new Connection(_config.ConnectionPort, true);
            var connected = await _stateConnection.InvokeAsync<bool>("Connection", connection, _cancellation.Token);
            if (connected)
            {
                _connectionStateSubject.OnNext(ConnectionState.Connected);
            }
        }
    }

    private int MultiplyRoundAndCrop(double value, int maximumAbsolute)
    {
        var maximized = Math.Max(-maximumAbsolute, Math.Min(maximumAbsolute, value));
        return (int)Math.Round(maximized);
    }

    private record struct Connection(string ConnectionName, bool Connected);

    private struct State
    {
        public int Pan { get; set; }
        public int Tilt { get; set; }
        public int Zoom { get; set; }
        public int Focus { get; set; }
    }
}
