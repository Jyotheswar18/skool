import { Request, Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
export declare class FeeController {
    static pay: (req: AuthRequest, res: Response) => Promise<void>;
    static getStudentInstallments: (req: Request, res: Response) => Promise<void>;
    static report: (req: Request, res: Response) => Promise<void>;
    static getOverdue: (req: Request, res: Response) => Promise<void>;
    static getAllStudentsFeeBoard: (req: Request, res: Response) => Promise<void>;
    static sendManualReminder: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=fee.controller.d.ts.map