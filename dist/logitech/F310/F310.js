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
exports.F310 = void 0;
var node_gamepad_1 = require("@sensslen/node-gamepad");
var gamepadConfig = __importStar(require("@sensslen/node-gamepad/controllers/logitech/gamepadf310.json"));
var events_1 = require("events");
var eInputChangeDirection_1 = require("../../ConfigurationHelper/eInputChangeDirection");
var eF310SpecialFunctionKey_1 = require("./eF310SpecialFunctionKey");
var eSpecialFunctionType_1 = require("../../ConfigurationHelper/eSpecialFunctionType");
var interpolate = require('everpolate').linear;
var eAltKeyState;
(function (eAltKeyState) {
    eAltKeyState[eAltKeyState["default"] = 0] = "default";
    eAltKeyState[eAltKeyState["alt"] = 1] = "alt";
    eAltKeyState[eAltKeyState["altLower"] = 2] = "altLower";
})(eAltKeyState || (eAltKeyState = {}));
var F310 = /** @class */ (function () {
    function F310(config, logger, mixerFactory) {
        var _this = this;
        this.config = config;
        this.logger = logger;
        this.moveInterpolation = [
            [0, 63, 31, 127, 128, 160, 172, 255],
            [255, 70, 20, 0, 0, -20, -70, -255],
        ];
        this._connectionEmitter = new events_1.EventEmitter();
        this.altKeyState = eAltKeyState.default;
        this._connected = false;
        var padConfig = gamepadConfig;
        if (config.SerialNumber) {
            padConfig.serialNumber = config.SerialNumber;
        }
        var gamepadLogger = {
            Log: function (tolog) { return _this.logger.log(tolog); },
        };
        this.pad = new node_gamepad_1.NodeGamepad(padConfig, gamepadLogger);
        this.mixer = mixerFactory.get(config.VideoMixer.Connection);
        this.pad.on('left:move', function (value) {
            var _a, _b;
            var pan = interpolate(value.x, _this.moveInterpolation[0], _this.moveInterpolation[1])[0];
            (_a = _this.mixer) === null || _a === void 0 ? void 0 : _a.pan(config.VideoMixer.MixBlock, pan);
            var tilt = -interpolate(value.y, _this.moveInterpolation[0], _this.moveInterpolation[1])[0];
            (_b = _this.mixer) === null || _b === void 0 ? void 0 : _b.tilt(config.VideoMixer.MixBlock, tilt);
        });
        this.pad.on('right:move', function (value) {
            var _a, _b;
            (_a = _this.mixer) === null || _a === void 0 ? void 0 : _a.zoom(config.VideoMixer.MixBlock, Math.round((-value.y + 127) / 16));
            (_b = _this.mixer) === null || _b === void 0 ? void 0 : _b.focus(config.VideoMixer.MixBlock, Math.round((value.x - 127) / 200));
        });
        this.pad.on('dpadLeft:press', function () {
            _this.changeConnection(eInputChangeDirection_1.eInputChangeDirection.left);
        });
        this.pad.on('dpadUp:press', function () {
            _this.changeConnection(eInputChangeDirection_1.eInputChangeDirection.up);
        });
        this.pad.on('dpadRight:press', function () {
            _this.changeConnection(eInputChangeDirection_1.eInputChangeDirection.right);
        });
        this.pad.on('dpadDown:press', function () {
            _this.changeConnection(eInputChangeDirection_1.eInputChangeDirection.down);
        });
        this.pad.on('RB:press', function () {
            var _a;
            (_a = _this.mixer) === null || _a === void 0 ? void 0 : _a.cut(config.VideoMixer.MixBlock);
        });
        this.pad.on('RT:press', function () {
            var _a;
            (_a = _this.mixer) === null || _a === void 0 ? void 0 : _a.auto(config.VideoMixer.MixBlock);
        });
        this.pad.on('LB:press', function () {
            if (_this.altKeyState == eAltKeyState.default) {
                _this.altKeyState = eAltKeyState.alt;
            }
        });
        this.pad.on('LB:release', function () {
            if (_this.altKeyState == eAltKeyState.alt) {
                _this.altKeyState = eAltKeyState.default;
            }
        });
        this.pad.on('LT:press', function () {
            if (_this.altKeyState == eAltKeyState.default) {
                _this.altKeyState = eAltKeyState.altLower;
            }
        });
        this.pad.on('LT:release', function () {
            if (_this.altKeyState == eAltKeyState.altLower) {
                _this.altKeyState = eAltKeyState.default;
            }
        });
        this.pad.on('A:press', function () {
            _this.specialFunction(eF310SpecialFunctionKey_1.eF310SpecialFunctionKey.a);
        });
        this.pad.on('B:press', function () {
            _this.specialFunction(eF310SpecialFunctionKey_1.eF310SpecialFunctionKey.b);
        });
        this.pad.on('X:press', function () {
            _this.specialFunction(eF310SpecialFunctionKey_1.eF310SpecialFunctionKey.x);
        });
        this.pad.on('Y:press', function () {
            _this.specialFunction(eF310SpecialFunctionKey_1.eF310SpecialFunctionKey.y);
        });
        this.pad.start();
    }
    Object.defineProperty(F310.prototype, "connected", {
        get: function () {
            return this._connected;
        },
        set: function (v) {
            this._connected = v;
        },
        enumerable: false,
        configurable: true
    });
    F310.prototype.subscribe = function (i) {
        i.change(this._connected);
        this._connectionEmitter.on('change', i.change);
    };
    F310.prototype.unsubscribe = function (i) {
        this._connectionEmitter.removeListener('change', i.change);
    };
    F310.prototype.dispose = function () {
        this.pad.stop();
    };
    F310.prototype.changeConnection = function (direction) {
        var _a;
        var nextInput = this.config.ConnectionChange.Default[direction];
        switch (this.altKeyState) {
            case eAltKeyState.alt:
                if (this.config.ConnectionChange.Alt) {
                    nextInput = this.config.ConnectionChange.Alt[direction];
                }
                break;
            case eAltKeyState.altLower:
                if (this.config.ConnectionChange.AltLower) {
                    nextInput = this.config.ConnectionChange.AltLower[direction];
                }
                break;
            default:
                break;
        }
        if (nextInput) {
            (_a = this.mixer) === null || _a === void 0 ? void 0 : _a.changeInput(this.config.VideoMixer.MixBlock, nextInput);
        }
    };
    F310.prototype.specialFunction = function (key) {
        var _a, _b;
        var specialFunction = this.config.SpecialFunction.Default[key];
        switch (this.altKeyState) {
            case eAltKeyState.alt:
                if (this.config.SpecialFunction.Alt) {
                    specialFunction = this.config.SpecialFunction.Alt[key];
                }
                break;
            case eAltKeyState.altLower:
                if (this.config.SpecialFunction.AltLower) {
                    specialFunction = this.config.SpecialFunction.AltLower[key];
                }
                break;
            default:
                break;
        }
        if (specialFunction) {
            switch (specialFunction.type) {
                case eSpecialFunctionType_1.eSpecialFunctionType.key:
                    (_a = this.mixer) === null || _a === void 0 ? void 0 : _a.toggleKey(this.config.VideoMixer.MixBlock, specialFunction.index);
                    break;
                case eSpecialFunctionType_1.eSpecialFunctionType.macro:
                    (_b = this.mixer) === null || _b === void 0 ? void 0 : _b.runMacro(specialFunction.index);
                    break;
            }
        }
    };
    return F310;
}());
exports.F310 = F310;
//# sourceMappingURL=F310.js.map