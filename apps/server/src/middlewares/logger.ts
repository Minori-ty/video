import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 获取请求信息
  const requestInfo = {
    method: req.method,
    url: req.url,
    params: req.params,
    query: req.query,
    body: req.body,
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
      authorization: req.headers.authorization ? '******' : undefined,
    },
    timestamp: new Date().toISOString(),
  };

  // 记录请求信息
  logger.info({
    message: '收到请求',
    request: requestInfo,
  });

  // 记录响应时间
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: '请求完成',
      response: {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
      request: {
        method: req.method,
        url: req.url,
      },
    });
  });

  next();
};
