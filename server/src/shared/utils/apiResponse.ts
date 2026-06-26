import { Response } from 'express';
import { ApiResponse, PaginationResult } from '../types/common.types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  pagination?: PaginationResult
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    ...(pagination && { pagination }),
  };
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  details?: any[]
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  details: any[]
): void => {
  sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
};
