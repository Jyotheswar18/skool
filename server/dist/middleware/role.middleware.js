"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const apiResponse_1 = require("../shared/utils/apiResponse");
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, apiResponse_1.sendError)(res, 'Unauthorized access', 401, 'UNAUTHORIZED');
        }
        if (!allowedRoles.includes(req.user.role)) {
            return (0, apiResponse_1.sendError)(res, `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}`, 403, 'FORBIDDEN');
        }
        next();
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=role.middleware.js.map