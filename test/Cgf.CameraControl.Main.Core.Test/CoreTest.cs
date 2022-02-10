using System.Text.Json;
using Cgf.CameraControl.Main.Core.Logging;
using Moq;
using NUnit.Framework;

namespace Cgf.CameraControl.Main.Core.Test;

[TestFixture]
internal class CoreTest
{
    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger>();
        _uut = new Core(_logger.Object);
    }

    private Core? _uut;
    private Mock<ILogger>? _logger;

    [Test]
    public void Bootstrap_Should_ThrowError_If_CamsPropertyMissingInInput()
    {
        var json = "{\"videoMixers\":[],\"interfaces\":[]}";
        using var document = JsonDocument.Parse(json);
        var exception = Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Bootstrap(document));
        Assert.AreEqual("Property cams not found", exception!.Message);
        Assert.IsNull(exception.InnerException);
    }

    [TestCase("{\"cams\":null,\"videoMixers\":[],\"interfaces\":[]}", "null")]
    [TestCase("{\"cams\":true,\"videoMixers\":[],\"interfaces\":[]}", "True")]
    [TestCase("{\"cams\":false,\"videoMixers\":[],\"interfaces\":[]}", "False")]
    [TestCase("{\"cams\":1,\"videoMixers\":[],\"interfaces\":[]}", "1")]
    [TestCase("{\"cams\":1.5,\"videoMixers\":[],\"interfaces\":[]}", "1.5")]
    [TestCase("{\"cams\":\"bladibla\",\"videoMixers\":[],\"interfaces\":[]}", "\"bladibla\"")]
    [TestCase("{\"cams\":{},\"videoMixers\":[],\"interfaces\":[]}", "{}")]
    [TestCase("{\"cams\":{\"abc\":\"def\"},\"videoMixers\":[],\"interfaces\":[]}", "{\"abc\":\"def\"}")]
    public void Bootstrap_Should_ThrowError_If_CamsPropertyMissingInInput(string json, string camsProperty)
    {
        using var document = JsonDocument.Parse(json);
        var exception = Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Bootstrap(document));
        Assert.AreEqual($"The cams property must be an array. --{camsProperty}-- is not an array.", exception!.Message);
        Assert.IsNull(exception.InnerException);
    }

    [Test]
    public void Bootstrap_Should_ThrowError_If_VideoMixersPropertyMissingInInput()
    {
        var json = "{\"cams\":[],\"interfaces\":[]}";
        using var document = JsonDocument.Parse(json);
        var exception = Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Bootstrap(document));
        Assert.AreEqual("Property videoMixers not found", exception!.Message);
        Assert.IsNull(exception.InnerException);
    }

    [TestCase("{\"videoMixers\":null,\"cams\":[],\"interfaces\":[]}", "null")]
    [TestCase("{\"videoMixers\":true,\"cams\":[],\"interfaces\":[]}", "True")]
    [TestCase("{\"videoMixers\":false,\"cams\":[],\"interfaces\":[]}", "False")]
    [TestCase("{\"videoMixers\":1,\"cams\":[],\"interfaces\":[]}", "1")]
    [TestCase("{\"videoMixers\":1.5,\"cams\":[],\"interfaces\":[]}", "1.5")]
    [TestCase("{\"videoMixers\":\"bladibla\",\"cams\":[],\"interfaces\":[]}", "\"bladibla\"")]
    [TestCase("{\"videoMixers\":{},\"cams\":[],\"interfaces\":[]}", "{}")]
    [TestCase("{\"videoMixers\":{\"abc\":\"def\"},\"cams\":[],\"interfaces\":[]}", "{\"abc\":\"def\"}")]
    public void Bootstrap_Should_ThrowError_If_VideoMixersPropertyMissingInInput(string json,
        string videoMixersProperty)
    {
        using var document = JsonDocument.Parse(json);
        var exception = Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Bootstrap(document));
        Assert.AreEqual($"The videoMixers property must be an array. --{videoMixersProperty}-- is not an array.",
            exception!.Message);
        Assert.IsNull(exception.InnerException);
    }

    [Test]
    public void Bootstrap_Should_ThrowError_If_InterfacesPropertyMissingInInput()
    {
        var json = "{\"cams\":[],\"videoMixers\":[]}";
        using var document = JsonDocument.Parse(json);
        var exception = Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Bootstrap(document));
        Assert.AreEqual("Property interfaces not found", exception!.Message);
        Assert.IsNull(exception.InnerException);
    }

    [TestCase("{\"interfaces\":null,\"cams\":[],\"videoMixers\":[]}", "null")]
    [TestCase("{\"interfaces\":true,\"cams\":[],\"videoMixers\":[]}", "True")]
    [TestCase("{\"interfaces\":false,\"cams\":[],\"videoMixers\":[]}", "False")]
    [TestCase("{\"interfaces\":1,\"cams\":[],\"videoMixers\":[]}", "1")]
    [TestCase("{\"interfaces\":1.5,\"cams\":[],\"videoMixers\":[]}", "1.5")]
    [TestCase("{\"interfaces\":\"bladibla\",\"cams\":[],\"videoMixers\":[]}", "\"bladibla\"")]
    [TestCase("{\"interfaces\":{},\"cams\":[],\"videoMixers\":[]}", "{}")]
    [TestCase("{\"interfaces\":{\"abc\":\"def\"},\"cams\":[],\"videoMixers\":[]}", "{\"abc\":\"def\"}")]
    public void Bootstrap_Should_ThrowError_If_InterfacesPropertyMissingInInput(string json,
        string interfacesProperty)
    {
        using var document = JsonDocument.Parse(json);
        var exception = Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Bootstrap(document));
        Assert.AreEqual($"The interfaces property must be an array. --{interfacesProperty}-- is not an array.",
            exception!.Message);
        Assert.IsNull(exception.InnerException);
    }
}
