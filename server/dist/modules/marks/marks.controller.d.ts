import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
export declare class MarksController {
    /**
     * Get all students in a class/section with their existing marks (if any)
     */
    static getStudentsWithMarks: (req: AuthRequest, res: Response) => Promise<void>;
    /**
     * Upload or update marks in bulk for a class/section
     */
    static uploadMarks: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=marks.controller.d.ts.map