﻿using System.Text.Json;

namespace Cgf.CameraControl.Main.Core.GenericFactory;

public interface IFactoryPlugin<T>
{
    IAsyncEnumerable<string> GetSupportedTypeIdentifiers();
    ValueTask<T> Create(JsonElement configuration, string supportedTypeIdentifier);
}
