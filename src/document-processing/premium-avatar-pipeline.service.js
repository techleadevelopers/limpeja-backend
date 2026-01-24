"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PremiumAvatarPipelineService = void 0;
var common_1 = require("@nestjs/common");
var axios_1 = require("axios");
var form_data_1 = require("form-data");
var cloudinary_1 = require("cloudinary");
var PremiumAvatarPipelineService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PremiumAvatarPipelineService = _classThis = /** @class */ (function () {
        function PremiumAvatarPipelineService_1() {
            this.logger = new common_1.Logger(PremiumAvatarPipelineService.name);
            this.removeBgKey = process.env.REMOVE_BG_API_KEY;
            this.cloudinaryConfigured = !!process.env.CLOUDINARY_CLOUD_NAME &&
                !!process.env.CLOUDINARY_API_KEY &&
                !!process.env.CLOUDINARY_API_SECRET;
            if (this.cloudinaryConfigured) {
                cloudinary_1.v2.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });
            }
        }
        PremiumAvatarPipelineService_1.prototype.process = function (buffer, mimetype) {
            return __awaiter(this, void 0, void 0, function () {
                var workingBuffer, workingMime, error_1, result, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            workingBuffer = buffer;
                            workingMime = mimetype;
                            if (!this.removeBgKey) return [3 /*break*/, 4];
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.removeBackground(workingBuffer, mimetype)];
                        case 2:
                            workingBuffer = _a.sent();
                            workingMime = 'image/png';
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            this.logger.warn('Remove.bg background removal falhou, mantendo imagem original.', error_1);
                            return [3 /*break*/, 4];
                        case 4:
                            if (!this.cloudinaryConfigured) return [3 /*break*/, 8];
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, this.applyCloudinaryTransform(workingBuffer)];
                        case 6:
                            result = _a.sent();
                            workingBuffer = result.buffer;
                            workingMime = result.mimeType;
                            return [3 /*break*/, 8];
                        case 7:
                            error_2 = _a.sent();
                            this.logger.warn('Cloudinary Premium Showcase falhou, mantendo imagem atual.', error_2);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/, { buffer: workingBuffer, mimeType: workingMime }];
                    }
                });
            });
        };
        PremiumAvatarPipelineService_1.prototype.removeBackground = function (buffer, mimetype) {
            return __awaiter(this, void 0, void 0, function () {
                var form, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.removeBgKey)
                                return [2 /*return*/, buffer];
                            form = new form_data_1.default();
                            form.append('image_file', buffer, {
                                filename: 'avatar.png',
                                contentType: mimetype,
                            });
                            form.append('size', 'auto');
                            return [4 /*yield*/, axios_1.default.post('https://api.remove.bg/v1.0/removebg', form, {
                                    headers: __assign(__assign({}, form.getHeaders()), { 'X-Api-Key': this.removeBgKey }),
                                    responseType: 'arraybuffer',
                                    timeout: 120000,
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, Buffer.from(response.data)];
                    }
                });
            });
        };
        PremiumAvatarPipelineService_1.prototype.applyCloudinaryTransform = function (buffer) {
            return __awaiter(this, void 0, void 0, function () {
                var uploadResponse, downloadUrl, downloadResult, mimeType;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.cloudinaryConfigured) {
                                return [2 /*return*/, { buffer: buffer, mimeType: 'image/jpeg' }];
                            }
                            return [4 /*yield*/, new Promise(function (resolve, reject) {
                                    var stream = cloudinary_1.v2.uploader.upload_stream({
                                        folder: 'premium-showcase',
                                        resource_type: 'image',
                                        transformation: [
                                            {
                                                width: 720,
                                                height: 720,
                                                crop: 'thumb',
                                                gravity: 'face',
                                                background: '#E4E8EF',
                                            },
                                            {
                                                effect: 'vibrance:30',
                                            },
                                            {
                                                effect: 'brightness:8',
                                            },
                                            {
                                                effect: 'colorize:15',
                                            },
                                        ],
                                        quality: 'auto:good',
                                    }, function (error, result) {
                                        if (error)
                                            return reject(error);
                                        if (!result)
                                            return reject(new Error('Cloudinary não retornou resultado.'));
                                        resolve(result);
                                    });
                                    stream.end(buffer);
                                })];
                        case 1:
                            uploadResponse = (_a.sent());
                            downloadUrl = uploadResponse.secure_url || uploadResponse.url;
                            if (!downloadUrl) {
                                throw new Error('Cloudinary não retornou URL pública para o avatar premium.');
                            }
                            return [4 /*yield*/, axios_1.default.get(downloadUrl, {
                                    responseType: 'arraybuffer',
                                    timeout: 60000,
                                })];
                        case 2:
                            downloadResult = _a.sent();
                            mimeType = uploadResponse.format ? "image/".concat(uploadResponse.format) : 'image/jpeg';
                            return [2 /*return*/, { buffer: Buffer.from(downloadResult.data), mimeType: mimeType }];
                    }
                });
            });
        };
        return PremiumAvatarPipelineService_1;
    }());
    __setFunctionName(_classThis, "PremiumAvatarPipelineService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PremiumAvatarPipelineService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PremiumAvatarPipelineService = _classThis;
}();
exports.PremiumAvatarPipelineService = PremiumAvatarPipelineService;
