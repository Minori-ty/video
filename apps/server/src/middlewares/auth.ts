import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { privateKey } from '../config/keys';
import { AppError } from './error';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// 扩展 Express 的 Request 类型
interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError(401, '未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, '认证令牌格式错误');
    }

    const decoded = jwt.verify(token, privateKey, {
      algorithms: ['RS256'],
    }) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, '无效的认证令牌'));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, '未认证'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, '无权限访问'));
    }

    next();
  };
};
