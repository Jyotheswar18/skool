import { Request, Response, NextFunction } from 'express';
export declare const requireRole: (...allowedRoles: ("admin" | "teacher")[]) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map