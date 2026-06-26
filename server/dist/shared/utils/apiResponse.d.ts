import { Response } from 'express';
import { PaginationResult } from '../types/common.types';
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number, pagination?: PaginationResult) => void;
export declare const sendError: (res: Response, message: string, statusCode?: number, code?: string, details?: any[]) => void;
export declare const sendValidationError: (res: Response, details: any[]) => void;
//# sourceMappingURL=apiResponse.d.ts.map