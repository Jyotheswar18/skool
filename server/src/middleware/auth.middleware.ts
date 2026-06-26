import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { sendError } from '../shared/utils/apiResponse';
import { IUserDocument } from '../modules/auth/user.model';

export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: IUserDocument | false, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const message = info && info.message ? info.message : 'Unauthorized access';
      return sendError(res, message, 401, 'UNAUTHORIZED');
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
