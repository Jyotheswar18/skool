import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const validateRequest: (schema: z.ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validate.middleware.d.ts.map