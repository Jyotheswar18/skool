"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoute = void 0;
const passport_1 = __importDefault(require("passport"));
const apiResponse_1 = require("../shared/utils/apiResponse");
const protectRoute = (req, res, next) => {
    passport_1.default.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            const message = info && info.message ? info.message : 'Unauthorized access';
            return (0, apiResponse_1.sendError)(res, message, 401, 'UNAUTHORIZED');
        }
        // Attach user to request
        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            assignedClasses: user.assignedClasses,
            assignedSections: user.assignedSections,
            status: user.status,
        };
        next();
    })(req, res, next);
};
exports.protectRoute = protectRoute;
//# sourceMappingURL=auth.middleware.js.map