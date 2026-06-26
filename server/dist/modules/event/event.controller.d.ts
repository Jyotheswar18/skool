import { Response } from 'express';
import { AuthRequest } from '../../shared/types/common.types';
export declare class EventController {
    static create: (req: AuthRequest, res: Response) => Promise<void>;
    static update: (req: AuthRequest, res: Response) => Promise<void>;
    static delete: (req: AuthRequest, res: Response) => Promise<void>;
    static getDetails: (req: AuthRequest, res: Response) => Promise<void>;
    static publish: (req: AuthRequest, res: Response) => Promise<void>;
    static uploadMedia: (req: AuthRequest, res: Response) => Promise<void>;
    static list: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=event.controller.d.ts.map