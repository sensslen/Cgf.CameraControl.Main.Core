using System.Collections.Generic;
using System.Threading;

namespace Cgf.CameraControl.Main.Core.Test.Helper.AsyncEnumerableExtension;

internal class AsyncEnumerable<T> : IAsyncEnumerable<T>
{
    private readonly IEnumerable<T> _synchronous;

    public AsyncEnumerable(IEnumerable<T> synchronous)
    {
        _synchronous = synchronous;
    }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = new()) =>
        new AsyncEnumerator<T>(_synchronous.GetEnumerator());
}