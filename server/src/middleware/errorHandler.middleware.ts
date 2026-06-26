import { Request, Response, NextFunction } from 'express';
import { sendError } from '../shared/utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('❌ Error caught by global handler:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(
      res,
      `Resource not found with id of ${err.value}`,
      400,
      'INVALID_ID'
    );
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(
      res,
      `Duplicate field value entered: ${field}`,
      400,
      'DUPLICATE_KEY_ERROR',
      [{ field, message: `${field} must be unique` }]
    );
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val: any) => ({
      field: val.path,
      message: val.message,
    }));
    return sendError(res, 'Database validation failed', 400, 'DB_VALIDATION_ERROR', details);
  }

  // General Error Response
  const details = env.NODE_ENV === 'development' ? { stack: err.stack } : undefined;
  sendError(res, message, statusCode, code, details ? [details] : undefined);
};
