"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendValidationError = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200, pagination) => {
    const response = {
        success: true,
        data,
        message,
        ...(pagination && { pagination }),
    };
    res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
    res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendValidationError = (res, details) => {
    (0, exports.sendError)(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
};
exports.sendValidationError = sendValidationError;
//# sourceMappingURL=apiResponse.js.map