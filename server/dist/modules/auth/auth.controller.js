"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_model_1 = require("./user.model");
const auth_service_1 = require("./auth.service");
const apiResponse_1 = require("../../shared/utils/apiResponse");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.login = async (req, res) => {
    const { email, password } = req.body;
    // Find user and select password explicitly (since select: false is in schema)
    const user = await user_model_1.User.findOne({ email }).select('+password');
    if (!user) {
        return (0, apiResponse_1.sendError)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    if (user.status !== 'active') {
        return (0, apiResponse_1.sendError)(res, 'Your account is inactive. Please contact admin.', 403, 'INACTIVE_USER');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return (0, apiResponse_1.sendError)(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    // Generate tokens
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = auth_service_1.AuthService.generateAccessToken(payload);
    const refreshToken = auth_service_1.AuthService.generateRefreshToken(payload);
    // Save login timestamp
    user.lastLogin = new Date();
    await user.save();
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return (0, apiResponse_1.sendSuccess)(res, {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mobile: user.mobile,
            assignedClasses: user.assignedClasses,
            assignedSections: user.assignedSections,
            status: user.status,
            lastLogin: user.lastLogin,
        },
        accessToken,
        refreshToken, // Also returning in body for clients not supporting/using cookies easily (e.g. mobile or generic frontend)
    }, 'Login successful');
};
AuthController.refresh = async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
    if (!refreshToken) {
        return (0, apiResponse_1.sendError)(res, 'Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
    }
    try {
        const decoded = auth_service_1.AuthService.verifyRefreshToken(refreshToken);
        const user = await user_model_1.User.findById(decoded.id);
        if (!user || user.status !== 'active') {
            return (0, apiResponse_1.sendError)(res, 'Invalid session or user inactive', 401, 'INVALID_SESSION');
        }
        const payload = { id: user._id.toString(), email: user.email, role: user.role };
        const newAccessToken = auth_service_1.AuthService.generateAccessToken(payload);
        const newRefreshToken = auth_service_1.AuthService.generateRefreshToken(payload);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return (0, apiResponse_1.sendSuccess)(res, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }, 'Token refreshed successfully');
    }
    catch (error) {
        return (0, apiResponse_1.sendError)(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
};
AuthController.logout = async (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    return (0, apiResponse_1.sendSuccess)(res, null, 'Logged out successfully');
};
AuthController.getMe = async (req, res) => {
    if (!req.user) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    return (0, apiResponse_1.sendSuccess)(res, { user: req.user }, 'Profile fetched successfully');
};
AuthController.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?._id;
    if (!userId) {
        return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    const user = await user_model_1.User.findById(userId).select('+password');
    if (!user) {
        return (0, apiResponse_1.sendError)(res, 'User not found', 404, 'USER_NOT_FOUND');
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
        return (0, apiResponse_1.sendError)(res, 'Incorrect old password', 400, 'INCORRECT_OLD_PASSWORD');
    }
    user.password = newPassword;
    await user.save();
    return (0, apiResponse_1.sendSuccess)(res, null, 'Password updated successfully');
};
//# sourceMappingURL=auth.controller.js.map