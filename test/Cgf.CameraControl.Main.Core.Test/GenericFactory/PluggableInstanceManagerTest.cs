using System.Text.Json;
using AutoFixture;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.Logging;
using Cgf.CameraControl.Main.Core.Test.Helper.AsyncEnumerableExtension;
using Cgf.CameraControl.Main.Core.Test.Helper.ShuffelledEnumerable;
using Moq;
using NUnit.Framework;

namespace Cgf.CameraControl.Main.Core.Test.GenericFactory;

[TestFixture(typeof(FactoryTestClass2))]
[TestFixture(typeof(FactoryTestClass))]
internal class PluggableInstanceManagerTest<T> where T : ITestAsyncDisposable
{
    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger>();
        _fixture = new Fixture();
        _uut
            = new PluggableInstanceManager<T>(_logger.Object);
    }

    private PluggableInstanceManager<T>? _uut;
    private Mock<ILogger>? _logger;
    private Fixture? _fixture;

    [TestCase("{\"type\":\"blabla\", \"instance\":1}", "blabla")]
    [TestCase("{\"type\":\"1\", \"instance\":1}", "1")]
    [TestCase("{\"type\":\"string\", \"instance\":1}", "string")]
    [TestCase("{\"type\":\"abc\", \"instance\":1}", "abc")]
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

        _logger!.Verify(m => m.Log(typeof(PluggableInstanceManager<T>).FullName!,
            $"Already a factory plugin registered that creates {twiceSupportedType}. Doing nothing.",
            LogLevel.Warning));
    }

    [TestCase("{\"type\":\"blabla\", \"instance\":1}", "blabla")]
    [TestCase("{\"type\":\"1\", \"instance\":1}", "1")]
    [TestCase("{\"type\":\"string\", \"instance\":1}", "string")]
    [TestCase("{\"type\":\"abc\", \"instance\":1}", "abc")]
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

        using var document = JsonDocument.Parse("{\"abc\":\"cde\", \"instance\":1}");
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual("Type property not found", exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }

    [Test]
    public async Task Create_Should_ThrowError_If_InstanceNumberIsMissing()
    {
        var pluginMock = new Mock<IFactoryPlugin<T>>();
        pluginMock.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(_fixture.CreateMany<string>().AsAsyncEnumerable());

        await _uut!.RegisterPlugin(pluginMock.Object);

        using var document = JsonDocument.Parse("{\"type\":\"abc\", \"abc\":\"cde\"}");
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual("Instance number property not found", exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }

    [TestCase("{\"type\":1, \"instance\":1}", "1")]
    [TestCase("{\"type\":[], \"instance\":1}", "[]")]
    [TestCase("{\"type\":{}, \"instance\":1}", "{}")]
    [TestCase("{\"type\":false, \"instance\":1}", "False")]
    [TestCase("{\"type\":true, \"instance\":1}", "True")]
    [TestCase("{\"type\":null, \"instance\":1}", "null")]
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

    [TestCase("{\"instance\":\"blablabla\",  \"type\":\"string\"}", "\"blablabla\"")]
    [TestCase("{\"instance\":\"1\",  \"type\":\"string\"}", "\"1\"")]
    [TestCase("{\"instance\":1.5,  \"type\":\"string\"}", "1.5")]
    [TestCase("{\"instance\":[], \"type\":\"string\"}", "[]")]
    [TestCase("{\"instance\":{}, \"type\":\"string\"}", "{}")]
    [TestCase("{\"instance\":false, \"type\":\"string\"}", "False")]
    [TestCase("{\"instance\":true, \"type\":\"string\"}", "True")]
    [TestCase("{\"instance\":null, \"type\":\"string\"}", "null")]
    public async Task Create_Should_ThrowError_If_InstancePropertyIdentifierIsNotInteger(string inputJson,
        string instancePropertyAsString)
    {
        var pluginMock = new Mock<IFactoryPlugin<T>>();
        pluginMock.Setup(m => m.GetSupportedTypeIdentifiers())
            .Returns(_fixture.CreateMany<string>().AsAsyncEnumerable());

        await _uut!.RegisterPlugin(pluginMock.Object);

        using var document = JsonDocument.Parse(inputJson);
        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual(
            $"Instance number property must be an integer. --{instancePropertyAsString}-- is not an integer.",
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
                var instance = _fixture.Create<int>();
                var json = $"{{\"type\":\"{type}\", \"instance\":{instance}}}";

                using var document = JsonDocument.Parse(json);
                await _uut!.Create(document.RootElement);

                pluginMock.Verify(m => m.Create(document.RootElement, type), Times.Once);
            }
        }
    }

    [Test]
    public async Task Create_Should_ThrowError_If_InstanceNumberIsAlreadyAvailable()
    {
        var type = _fixture.Create<string>();
        var instance = _fixture.Create<int>();
        var plugin = new Mock<IFactoryPlugin<T>>();
        plugin.Setup(m => m.GetSupportedTypeIdentifiers()).Returns(new[] { type }.AsAsyncEnumerable());
        await _uut!.RegisterPlugin(plugin.Object);

        var json = $"{{\"type\":\"{type}\", \"instance\":{instance}}}";
        using var document = JsonDocument.Parse(json);
        await _uut!.Create(document.RootElement);

        var exception =
            Assert.ThrowsAsync<ConfigurationException>(async () => await _uut!.Create(document.RootElement));
        Assert.AreEqual($"There was already an instance created with number {instance}",
            exception!.Message);
        Assert.IsNull(exception.InnerException);
    }

    [Test]
    public async Task Create_Should_ThrowError_If_RequestingPluginOfRegisteredType_And_CreationFails()
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
                var instance = _fixture.Create<int>();
                var json = $"{{\"type\":\"{type}\",\"instance\":{instance}}}";

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

    [Test]
    public void Get_Should_ReturnDefault_If_InstanceIsNotAvailable()
    {
        var instanceNr = _fixture.Create<int>();

        var instance = _uut!.Get(instanceNr);
        Assert.AreEqual(default, instance);
    }

    [Test]
    public async Task Get_Should_ReturnTheInstanceThatWasCreatedForThisInstanceNumber()
    {
        var type = _fixture.Create<string>();
        var instancesAndNumbers = _fixture.Create<Dictionary<int, T>>();
        var plugin = new Mock<IFactoryPlugin<T>>();
        plugin.Setup(m => m.GetSupportedTypeIdentifiers()).Returns(new[] { type }.AsAsyncEnumerable());
        plugin.Setup(m => m.Create(It.IsAny<JsonElement>(), type)).Returns((JsonElement element, string _) =>
        {
            var instanceProperty = element.GetProperty("instance");
            var instance = instanceProperty.GetInt32();
            return ValueTask.FromResult(instancesAndNumbers[instance]);
        });

        await _uut!.RegisterPlugin(plugin.Object);

        foreach (var instanceAndNumber in instancesAndNumbers)
        {
            var json = $"{{\"type\":\"{type}\",\"instance\":{instanceAndNumber.Key}}}";
            using var document = JsonDocument.Parse(json);

            await _uut!.Create(document.RootElement);
        }

        foreach (var instanceAndNumber in instancesAndNumbers)
        {
            var json = $"{{\"type\":\"{type}\",\"instance\":{instanceAndNumber.Key}}}";
            using var document = JsonDocument.Parse(json);

            var instance = _uut!.Get(instanceAndNumber.Key);
            Assert.AreEqual(instanceAndNumber.Value, instance);
        }
    }

    [Test]
    public async Task Dispose_Should_DisposeAllCreatedInstances()
    {
        var type = _fixture.Create<string>();
        var instancesAndNumbers = _fixture.Create<Dictionary<int, T>>();
        var plugin = new Mock<IFactoryPlugin<T>>();
        plugin.Setup(m => m.GetSupportedTypeIdentifiers()).Returns(new[] { type }.AsAsyncEnumerable());
        plugin.Setup(m => m.Create(It.IsAny<JsonElement>(), type)).Returns((JsonElement element, string _) =>
        {
            var instanceProperty = element.GetProperty("instance");
            var instance = instanceProperty.GetInt32();
            return ValueTask.FromResult(instancesAndNumbers[instance]);
        });

        await _uut!.RegisterPlugin(plugin.Object);

        foreach (var instanceAndNumber in instancesAndNumbers)
        {
            var json = $"{{\"type\":\"{type}\",\"instance\":{instanceAndNumber.Key}}}";
            using var document = JsonDocument.Parse(json);

            await _uut!.Create(document.RootElement);
        }

        await _uut!.DisposeAsync();

        foreach (var instanceAndNumber in instancesAndNumbers)
        {
            Assert.IsTrue(instanceAndNumber.Value.Disposed);
        }
    }
}
