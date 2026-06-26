import { Request, Response, NextFunction } from 'express';
export declare const uploadSingle: (fieldName: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadMultiple: (fieldName: string, maxCount?: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.middleware.d.ts.map