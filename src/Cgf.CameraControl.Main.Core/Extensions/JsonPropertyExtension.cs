using System.Text.Json;

namespace Cgf.CameraControl.Main.Core.Extensions;

public static class JsonPropertyExtension
{
    public static string Format(this JsonElement property)
    {
        switch (property.ValueKind)
        {
            case JsonValueKind.Null:
                return "null";
            case JsonValueKind.Undefined:
                return "undefined";
            case JsonValueKind.String:
                return $"\"{property.ToString()}\"";
            default:
                return property.ToString();
        }
    }
}
