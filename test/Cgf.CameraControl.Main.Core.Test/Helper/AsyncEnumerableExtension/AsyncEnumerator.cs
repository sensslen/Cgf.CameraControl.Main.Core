﻿using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cgf.CameraControl.Main.Core.Test.Helper.AsyncEnumerableExtension;

internal class AsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _sync;

    public AsyncEnumerator(IEnumerator<T> sync)
    {
        _sync = sync;
    }

    public ValueTask DisposeAsync()
    {
        _sync.Dispose();
        return ValueTask.CompletedTask;
    }

    public ValueTask<bool> MoveNextAsync()
    {
        var result = _sync.MoveNext();
        return ValueTask.FromResult(result);
    }

    public T Current => _sync.Current;
}