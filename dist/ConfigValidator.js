"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidator = void 0;
var ajv_1 = __importDefault(require("ajv"));
var ConfigValidator = /** @class */ (function () {
    function ConfigValidator() {
        this._ajv = new ajv_1.default();
    }
    ConfigValidator.prototype.validate = function (config, schema) {
        if (this._ajv.validate(schema, config)) {
            return config;
        }
        else {
            return undefined;
        }
    };
    ConfigValidator.prototype.errorGet = function () {
        return this._ajv.errorsText();
    };
    return ConfigValidator;
}());
exports.ConfigValidator = ConfigValidator;
//# sourceMappingURL=ConfigValidator.js.map