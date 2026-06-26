import { Request, Response } from 'express';
import { User } from './user.model';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse';

export class AuthController {
  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user and select password explicitly (since select: false is in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== 'active') {
      return sendError(res, 'Your account is inactive. Please contact admin.', 403, 'INACTIVE_USER');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const accessToken = AuthService.generateAccessToken(payload);
    const refreshToken = AuthService.generateRefreshToken(payload);

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

    return sendSuccess(
      res,
      {
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
      },
      'Login successful'
    );
  };

  static refresh = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400, 'REFRESH_TOKEN_REQUIRED');
    }

    try {
      const decoded = AuthService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user || user.status !== 'active') {
        return sendError(res, 'Invalid session or user inactive', 401, 'INVALID_SESSION');
      }

      const payload = { id: user._id.toString(), email: user.email, role: user.role };
      const newAccessToken = AuthService.generateAccessToken(payload);
      const newRefreshToken = AuthService.generateRefreshToken(payload);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(
        res,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      return sendError(res, 'Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  };

  static logout = async (req: Request, res: Response) => {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return sendSuccess(res, null, 'Logged out successfully');
  };

  static getMe = async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }
    return sendSuccess(res, { user: req.user }, 'Profile fetched successfully');
  };

  static changePassword = async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return sendError(res, 'Incorrect old password', 400, 'INCORRECT_OLD_PASSWORD');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password updated successfully');
  };
}
