namespace Cgf.CameraControl.Main.Core.Test.Helper.AsyncEnumerableExtension;

internal static class AsyncEnumerableExtension
{
    public static IAsyncEnumerable<T> AsAsyncEnumerable<T>(this IEnumerable<T> synchronous) =>
        new AsyncEnumerable<T>(synchronous);

    public static async Task<IEnumerable<T>> Synchronize<T>(this IAsyncEnumerable<T> async)
    {
        var list = new List<T>();
        await foreach (var item in async)
        {
            lock (list)
            {
                list.Add(item);
            }
        }

        return list;
    }
}
