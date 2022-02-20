namespace Cgf.CameraControl.Main.Core.Extensions;

public static class AsyncEnumerableExtension
{
    public static IAsyncEnumerable<T> AsAsyncEnumerable<T>(this IEnumerable<T> enumerable)
    {
        var enumerator = enumerable.GetEnumerator();
        return AsyncEnumerable.Create(_
            => AsyncEnumerator.Create(
                () => ValueTask.FromResult(enumerator.MoveNext()),
                () => enumerator.Current,
                () =>
                {
                    enumerator.Dispose();
                    return ValueTask.CompletedTask;
                })
        );
    }
}
