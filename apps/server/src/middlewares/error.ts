import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    // 记录业务错误
    logger.warn({
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });

    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // 记录系统错误
  logger.error({
    message: '未处理的错误',
    error: err,
    stack: err.stack,
  });

  res.status(500).json({
    error: '服务器内部错误',
  });
};
