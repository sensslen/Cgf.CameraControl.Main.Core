using System.Text.Json;
using AutoFixture;
using Cgf.CameraControl.Main.Core.Camera;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.HMI;
using Cgf.CameraControl.Main.Core.VideoMixer;
using Moq;
using NUnit.Framework;

namespace Cgf.CameraControl.Main.Core.Test;

[TestFixture]
internal class CoreTest
{
    [SetUp]
    public void SetUp()
    {
        _cameraInstanceManager = new Mock<IPluggableInstanceManager<ICamera>>();
        _videoMixerInstanceManager = new Mock<IPluggableInstanceManager<IVideoMixer>>();
        _hmiInstanceManager = new Mock<IPluggableInstanceManager<IHmi>>();
        _fixture = new Fixture();
        _uut = new Core(_cameraInstanceManager.Object, _videoMixerInstanceManager.Object, _hmiInstanceManager.Object);
    }

    [TearDown]
    public async ValueTask Teardown()
    {
        if (_uut == null)
        {
            return;
        }

        await _uut.DisposeAsync();
        _uut = null;
    }

    private Core? _uut;
    private Fixture? _fixture;
    private Mock<IPluggableInstanceManager<ICamera>>? _cameraInstanceManager;
    private Mock<IPluggableInstanceManager<IVideoMixer>>? _videoMixerInstanceManager;
    private Mock<IPluggableInstanceManager<IHmi>>? _hmiInstanceManager;

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

    [Test]
    public async ValueTask Bootstrap_Should_CreateNoInstancesForEmptyConfiguration()
    {
        var json = "{\"cams\":[],\"videoMixers\":[],\"interfaces\":[]}";
        using var document = JsonDocument.Parse(json);
        await _uut!.Bootstrap(document);

        _cameraInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
        _videoMixerInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
        _hmiInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
    }

    [Test]
    public async ValueTask Bootstrap_Should_CreateCorrectCameraInstances()
    {
        var cams = _fixture!.CreateMany<string>().ToArray();
        var jsonFormattedCams = string.Join(",", cams.Select(s => $"\"{s}\""));
        var json = $"{{\"cams\":[{jsonFormattedCams}],\"videoMixers\":[],\"interfaces\":[]}}";
        using var document = JsonDocument.Parse(json);
        await _uut!.Bootstrap(document);

        _cameraInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Exactly(cams.Length));
        _videoMixerInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
        _hmiInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);

        var camsJsonElements = document.RootElement.GetProperty("cams").EnumerateArray();
        Assert.AreEqual(cams.Length, camsJsonElements.Count());
        foreach (var cam in camsJsonElements)
        {
            _cameraInstanceManager.Verify(m => m.Create(cam), Times.Once);
        }
    }

    [Test]
    public async ValueTask Bootstrap_Should_CreateCorrectVideoMixersInstances()
    {
        var videoMixers = _fixture!.CreateMany<string>().ToArray();
        var jsonFormattedVideoMixers = string.Join(",", videoMixers.Select(s => $"\"{s}\""));
        var json = $"{{\"videoMixers\":[{jsonFormattedVideoMixers}],\"cams\":[],\"interfaces\":[]}}";
        using var document = JsonDocument.Parse(json);
        await _uut!.Bootstrap(document);

        _cameraInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
        _videoMixerInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Exactly(videoMixers.Length));
        _hmiInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);

        var videoMixersJsonElements = document.RootElement.GetProperty("videoMixers").EnumerateArray();
        Assert.AreEqual(videoMixers.Length, videoMixersJsonElements.Count());
        foreach (var videoMixer in videoMixersJsonElements)
        {
            _videoMixerInstanceManager.Verify(m => m.Create(videoMixer), Times.Once);
        }
    }

    [Test]
    public async ValueTask Bootstrap_Should_CreateCorrectInterfaceInstances()
    {
        var interfaces = _fixture!.CreateMany<string>().ToArray();
        var jsonFormattedInterfaces = string.Join(",", interfaces.Select(s => $"\"{s}\""));
        var json = $"{{\"interfaces\":[{jsonFormattedInterfaces}],\"cams\":[],\"videoMixers\":[]}}";
        using var document = JsonDocument.Parse(json);
        await _uut!.Bootstrap(document);

        _cameraInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
        _videoMixerInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Never);
        _hmiInstanceManager!.Verify(m => m.Create(It.IsAny<JsonElement>()), Times.Exactly(interfaces.Length));

        var interfacesJsonElements = document.RootElement.GetProperty("interfaces").EnumerateArray();
        Assert.AreEqual(interfaces.Length, interfacesJsonElements.Count());
        foreach (var hmi in interfacesJsonElements)
        {
            _hmiInstanceManager.Verify(m => m.Create(hmi), Times.Once);
        }
    }
}
