"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_1 = require("../shared/utils/apiResponse");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error caught by global handler:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const code = err.code || 'INTERNAL_ERROR';
    // Handle Mongoose CastError (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        return (0, apiResponse_1.sendError)(res, `Resource not found with id of ${err.value}`, 400, 'INVALID_ID');
    }
    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return (0, apiResponse_1.sendError)(res, `Duplicate field value entered: ${field}`, 400, 'DUPLICATE_KEY_ERROR', [{ field, message: `${field} must be unique` }]);
    }
    // Handle Mongoose ValidationError
    if (err.name === 'ValidationError') {
        const details = Object.values(err.errors).map((val) => ({
            field: val.path,
            message: val.message,
        }));
        return (0, apiResponse_1.sendError)(res, 'Database validation failed', 400, 'DB_VALIDATION_ERROR', details);
    }
    // General Error Response
    const details = env_1.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined;
    (0, apiResponse_1.sendError)(res, message, statusCode, code, details ? [details] : undefined);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.middleware.js.map