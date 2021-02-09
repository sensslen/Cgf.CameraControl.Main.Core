"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logitechf310Builder = void 0;
var ConfigValidator_1 = require("../ConfigValidator");
var ConfigSchema = __importStar(require("./Ilogitechf310Config.json"));
var logitechf310_1 = require("./logitechf310");
var logitechf310Builder = /** @class */ (function () {
    function logitechf310Builder(logger, mixerFactory) {
        this.logger = logger;
        this.mixerFactory = mixerFactory;
        this.Type = nameof();
    }
    logitechf310Builder.prototype.build = function (config) {
        var configValidator = new ConfigValidator_1.ConfigValidator();
        var validConfig = configValidator.validate(config, ConfigSchema);
        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }
        return new logitechf310_1.logitechf310(validConfig, this.logger, this.mixerFactory);
    };
    logitechf310Builder.prototype.error = function (error) {
        this.logger.error(nameof(logitechf310Builder) + ": " + error);
    };
    return logitechf310Builder;
}());
exports.logitechf310Builder = logitechf310Builder;
//# sourceMappingURL=logitechf310Builder.js.map