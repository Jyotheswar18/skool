import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
export declare class StudentController {
    static create: (req: AuthRequest, res: Response) => Promise<void>;
    static update: (req: AuthRequest, res: Response) => Promise<void>;
    static delete: (req: AuthRequest, res: Response) => Promise<void>;
    static getProfile: (req: AuthRequest, res: Response) => Promise<void>;
    static list: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=student.controller.d.ts.map