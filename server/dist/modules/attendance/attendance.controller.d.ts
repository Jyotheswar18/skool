import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
export declare class AttendanceController {
    static mark: (req: AuthRequest, res: Response) => Promise<void>;
    static list: (req: AuthRequest, res: Response) => Promise<void>;
    static report: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=attendance.controller.d.ts.map