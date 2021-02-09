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
exports.Rumblepad2Builder = void 0;
var ConfigValidator_1 = require("../../ConfigValidator");
var ConfigSchema = __importStar(require("./IRumblepad2Config.json"));
var Rumblepad2_1 = require("./Rumblepad2");
var Rumblepad2Builder = /** @class */ (function () {
    function Rumblepad2Builder(logger, mixerFactory) {
        this.logger = logger;
        this.mixerFactory = mixerFactory;
        this.Type = nameof();
    }
    Rumblepad2Builder.prototype.build = function (config) {
        var configValidator = new ConfigValidator_1.ConfigValidator();
        var validConfig = configValidator.validate(config, ConfigSchema);
        if (validConfig === undefined) {
            this.error(configValidator.errorGet());
            return undefined;
        }
        return new Rumblepad2_1.Rumblepad2(validConfig, this.logger, this.mixerFactory);
    };
    Rumblepad2Builder.prototype.error = function (error) {
        this.logger.error(nameof(Rumblepad2Builder) + ": " + error);
    };
    return Rumblepad2Builder;
}());
exports.Rumblepad2Builder = Rumblepad2Builder;
//# sourceMappingURL=Rumblepad2Builder.js.map