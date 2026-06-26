import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { sendValidationError } from '../shared/utils/apiResponse';

export const validateRequest = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      // Replace request parts with typed and sanitized validated data
      req.body = parsed.body;
      
      if (parsed.query) {
        for (const key in req.query) {
          delete (req.query as any)[key];
        }
        Object.assign(req.query as any, parsed.query);
      }
      
      if (parsed.params) {
        for (const key in req.params) {
          delete (req.params as any)[key];
        }
        Object.assign(req.params as any, parsed.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((err: any) => ({
          field: err.path.join('.').replace(/^(body|query|params)\./, ''),
          message: err.message,
        }));
        return sendValidationError(res, details);
      }
      next(error);
    }
  };
};
