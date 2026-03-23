import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  details?: unknown;
  isOperational: boolean;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
    this.isOperational = true;
  }
}

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV !== 'production') {
    if (err instanceof Error) {
      console.error(err.stack || err.message);
    } else {
      console.error(err);
    }
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? undefined,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    error: 'Unknown error occurred',
  });
};
