using System;
using System.Collections.Generic;
using System.Text.Json;
using Cgf.CameraControl.Main.Core.GenericFactory;
using Cgf.CameraControl.Main.Core.Logging;
using Moq;
using NUnit.Framework;

namespace Cgf.CameraControl.Main.Core.Test.GenericFactory;

[TestFixture(typeof(string))]
[TestFixture(typeof(FactoryTestClass))]
internal class PluggableFactoryTest<T>
{
    [SetUp]
    public void SetUp()
    {
        _logger = new Mock<ILogger>();
        _testLogModuleIdentifier = Guid.NewGuid().ToString();
        _uut
            = new PluggableFactory<T>(new Dictionary<string, IFactoryPlugin<T>>(), _logger.Object,
                _testLogModuleIdentifier);
    }

    private PluggableFactory<T>? _uut;
    private Mock<ILogger>? _logger;
    private string? _testLogModuleIdentifier;

    [TestCase("{\"type\":\"blabla\"}", "blabla")]
    [TestCase("{\"type\":\"1\"}", "1")]
    [TestCase("{\"type\":\"string\"}", "string")]
    [TestCase("{\"type\":\"abc\"}", "abc")]
    public void NoFactoryPluginRegistered_Should_ThrowErrorWhenCreatingEvenIfProperJson(string inputJson,
        string typeString)
    {
        using var document = JsonDocument.Parse(inputJson);
        var exception = Assert.ThrowsAsync<PluggableFactoryException>(async () => await _uut!.Create(document));
        Assert.AreEqual($"Could not find plugin for type {typeString}", exception!.Message);
        Assert.AreEqual(null, exception.InnerException);
    }
}