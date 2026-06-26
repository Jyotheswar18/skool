import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
export declare class DashboardController {
    static getAdminKpis: (req: AuthRequest, res: Response) => Promise<void>;
    static getTeacherKpis: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map