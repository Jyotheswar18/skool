"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigController = void 0;
const config_service_1 = require("./config.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class ConfigController {
}
exports.ConfigController = ConfigController;
_a = ConfigController;
ConfigController.get = async (req, res) => {
    const config = await config_service_1.ConfigService.getConfig();
    return (0, apiResponse_1.sendSuccess)(res, config, 'School configuration fetched successfully');
};
ConfigController.update = async (req, res) => {
    const config = await config_service_1.ConfigService.updateConfig(req.body);
    return (0, apiResponse_1.sendSuccess)(res, config, 'School configuration updated successfully');
};
//# sourceMappingURL=config.controller.js.map