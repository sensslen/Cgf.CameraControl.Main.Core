using System.Text.Json;
using AutoFixture;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.Logging;
using Cgf.CameraControl.Main.Core.Test.Helper.AsyncEnumerableExtension;
using Cgf.CameraControl.Main.Core.Test.Helper.ShuffelledEnumerable;
using Moq;
using NUnit.Framework;

namespace Cgf.CameraControl.Main.Core.Test.GenericFactory;

[TestFixture(typeof(int))]
[TestFixture(typeof(string))]
[TestFixture(typeof(FactoryTestClass))]
[TestFixture(typeof(FactoryTestClass2))]
internal class PluggableFactoryTest<T>
{
    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger>();
        _testLogModuleIdentifier = Guid.NewGuid().ToString();
        _fixture = new Fixture();
        _uut
            = new PluggableFactory<T>(new Dictionary<string, IFactoryPlugin<T>>(), _logger.Object,
                _testLogModuleIdentifier);
    }

    private PluggableFactory<T>? _uut;
    private Mock<ILogger>? _logger;
    private string? _testLogModuleIdentifier;
    private Fixture? _fixture;

    [TestCase("{\"type\":\"blabla\"}", "blabla")]
    [TestCase("{\"type\":\"1\"}", "1")]
    [TestCase("{\"type\":\"string\"}", "string")]
    [TestCase("{\"type\":\"abc\"}", "abc")]
    public void Create_Should_ThrowError_If_NoPluginRegistered(string inputJson,
        string typeString)
    {
        using var document = JsonDocument.Parse(inputJson);
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual($"Could not find plugin for type {typeString}", exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }

    [Test]
    public async Task RegisteringPlugin_Should_LogWarning_If_PluginForGivenTypeIsAlreadyRegistered()
    {
        var supportedTypes = _fixture.CreateMany<string>().ToArray();

        var pluginMock = new Mock<IFactoryPlugin<T>>();
        pluginMock.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(supportedTypes.AsAsyncEnumerable());
        var pluginMock2 = new Mock<IFactoryPlugin<T>>();
        var twiceSupportedType = supportedTypes.Shuffle().First();
        pluginMock2.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(new[] { twiceSupportedType }.AsAsyncEnumerable());

        await _uut!.RegisterPlugin(pluginMock.Object);
        await _uut!.RegisterPlugin(pluginMock2.Object);

        _logger!.Verify(m => m.Log(_testLogModuleIdentifier!,
            $"Already a factory plugin registered that creates {twiceSupportedType}. Doing nothing.",
            LogLevel.Warning));
    }

    [TestCase("{\"type\":\"blabla\"}", "blabla")]
    [TestCase("{\"type\":\"1\"}", "1")]
    [TestCase("{\"type\":\"string\"}", "string")]
    [TestCase("{\"type\":\"abc\"}", "abc")]
    public async Task Create_Should_ThrowError_If_RequestingPluginOfDifferentType(string inputJson,
        string typeString)
    {
        var pluginMock = new Mock<IFactoryPlugin<T>>();
        pluginMock.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(_fixture.CreateMany<string>().AsAsyncEnumerable());

        await _uut!.RegisterPlugin(pluginMock.Object);

        using var document = JsonDocument.Parse(inputJson);
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual($"Could not find plugin for type {typeString}", exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }

    [Test]
    public async Task Create_Should_ThrowError_If_TypeIdentifierIsMissing()
    {
        var pluginMock = new Mock<IFactoryPlugin<T>>();
        pluginMock.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(_fixture.CreateMany<string>().AsAsyncEnumerable());

        await _uut!.RegisterPlugin(pluginMock.Object);

        using var document = JsonDocument.Parse("{\"abc\":\"cde\"}");
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual("Type property not found", exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }

    [TestCase("{\"type\":1}", "1")]
    [TestCase("{\"type\":[]}", "[]")]
    [TestCase("{\"type\":[1,2,3]}", "[1,2,3]")]
    [TestCase("{\"type\":{}}", "{}")]
    [TestCase("{\"type\":{\"abc\":\"cde\"}}", "{\"abc\":\"cde\"}")]
    [TestCase("{\"type\":false}", "False")]
    [TestCase("{\"type\":true}", "True")]
    [TestCase("{\"type\":null}", "null")]
    public async Task Create_Should_ThrowError_If_TypeIdentifierIsNotString(string inputJson,
        string typePropertyAsString)
    {
        var pluginMock = new Mock<IFactoryPlugin<T>>();
        pluginMock.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(_fixture.CreateMany<string>().AsAsyncEnumerable());

        await _uut!.RegisterPlugin(pluginMock.Object);

        using var document = JsonDocument.Parse(inputJson);
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual($"Type property must be a string. --{typePropertyAsString}-- is not a string.",
            exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }

    [Test]
    public async Task Create_Should_Succeed_If_RequestingPluginOfRegisteredType()
    {
        var supportedTypes = _fixture.CreateMany<string[]>().ToArray();
        var pluginMocks = supportedTypes.Select(types =>
        {
            var result = new Mock<IFactoryPlugin<T>>();
            result.Setup(m => m.GetSupportedTypeIdentifiers()).Returns(types.AsAsyncEnumerable());
            return result;
        }).ToArray();

        foreach (var pluginMock in pluginMocks)
        {
            await _uut!.RegisterPlugin(pluginMock.Object);
        }

        var pluginMockIndex = 0;
        foreach (var typesOfEnumerator in supportedTypes)
        {
            var pluginMock = pluginMocks[pluginMockIndex++];

            foreach (var type in typesOfEnumerator)
            {
                var json = $"{{\"type\":\"{type}\"}}";

                using var document = JsonDocument.Parse(json);
                _ = await _uut!.Create(document.RootElement);

                pluginMock.Verify(m => m.Create(document.RootElement, type), Times.Once);
            }
        }
    }

    [Test]
    public async Task Create_Should_ReturnInstanceFromCorrectPlugin()
    {
        var instancesByType = _fixture.CreateMany<(string Type, T Instance)>().ToArray();
        var pluginMocks = instancesByType.Select(instanceAndType =>
        {
            var result = new Mock<IFactoryPlugin<T>>();
            result.Setup(m => m.GetSupportedTypeIdentifiers())
                .Returns(new[] { instanceAndType.Type }.AsAsyncEnumerable());
            result.Setup(m => m.Create(It.IsAny<JsonElement>(), instanceAndType.Type))
                .Returns(ValueTask.FromResult(instanceAndType.Instance));
            return result;
        }).ToArray();

        foreach (var pluginMock in pluginMocks)
        {
            await _uut!.RegisterPlugin(pluginMock.Object);
        }

        var pluginMockIndex = 0;
        foreach (var instanceAndType in instancesByType)
        {
            var pluginMock = pluginMocks[pluginMockIndex++];

            var json = $"{{\"type\":\"{instanceAndType.Type}\"}}";

            using var document = JsonDocument.Parse(json);
            var instance = await _uut!.Create(document.RootElement);

            pluginMock.Verify(m => m.Create(document.RootElement, instanceAndType.Type), Times.Once);
            Assert.AreEqual(instanceAndType.Instance, instance);
        }
    }

    [Test]
    public async Task Create_Should_ThrowError_If_RequestingPluginOfRegisteredType_And_CreationFailes()
    {
        var supportedTypes = _fixture.CreateMany<string[]>().ToArray();
        var pluginMocks = supportedTypes.Select(types =>
        {
            var result = new Mock<IFactoryPlugin<T>>();
            result.Setup(m => m.GetSupportedTypeIdentifiers()).Returns(types.AsAsyncEnumerable());
            result.Setup(m => m.Create(It.IsAny<JsonElement>(), It.IsAny<string>()))
                .Callback((JsonElement _, string type) => throw new Exception(type));
            return result;
        }).ToArray();

        foreach (var pluginMock in pluginMocks)
        {
            await _uut!.RegisterPlugin(pluginMock.Object);
        }

        var pluginMockIndex = 0;
        foreach (var typesOfEnumerator in supportedTypes)
        {
            var pluginMock = pluginMocks[pluginMockIndex++];

            foreach (var type in typesOfEnumerator)
            {
                var json = $"{{\"type\":\"{type}\"}}";

                using var document = JsonDocument.Parse(json);
                var exception =
                    Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
                Assert.AreEqual($"Failed to create type {type} from: {json}",
                    exception!.Message);
                Assert.IsInstanceOf<Exception>(exception.InnerException);
                Assert.AreEqual(type, exception.InnerException!.Message);
            }
        }
    }
}
